/**
 * Core audio engine — manages Web Audio API context, playback handles,
 * transport lifecycle, and real-time parameter updates.
 */

import type { TrackDefinition, TrackState } from '../types/trackData';
import type { CustomSoundRecord, MixerSnapshot } from '../types/mixData';
import { createImpulseResponse } from './synthesis';
import type { PlaybackHandle } from './audioTypes';
import type { PlaybackListener, PlaybackState } from './audioTypes';
import {
  DELAY_FEEDBACK_GAIN,
  DELAY_FILTER_FREQ_HZ,
  DELAY_MAX_TIME_S,
  DELAY_TIME_S,
  DELAY_WET_GAIN,
  EQ_TIME_CONSTANT,
  EFFECT_TIME_CONSTANT,
  FADE_IN_MS,
  FADE_MS,
  LOOP_START_LOOKAHEAD_S,
  ONESHOT_START_LOOKAHEAD_S,
  RATE_TIME_CONSTANT,
  REVERB_WET_GAIN,
  VOLUME_TIME_CONSTANT,
} from './audioConstants';
import {
  buildDelayChain,
  buildReverbChain,
  createPlaybackHandle,
} from './nodeFactory';
import { resolveTrackBuffer } from './bufferCache';
import {
  registerHandle,
  stopTrackHandles,
  updateTrackHandles,
  derivePlaybackState,
} from './handleRegistry';

export type { PlaybackState, PlaybackListener };

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const getEffectiveRate = (trackState: TrackState, globalTempo: number): number =>
  trackState.followsGlobalTempo ? globalTempo : trackState.speed;

export class AudioEngine {
  private context: AudioContext | null = null;

  private masterGain: GainNode | null = null;

  private reverbInputGain: GainNode | null = null;

  private delayInputGain: GainNode | null = null;

  private transportStartTime = 0;

  private transportActive = false;

  private activeHandles = new Map<string, Set<PlaybackHandle>>();

  private demoBufferCache = new Map<string, AudioBuffer>();

  private customBufferCache = new Map<string, AudioBuffer>();

  private playbackListeners = new Set<PlaybackListener>();

  async ensureContext(): Promise<AudioContext> {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.context.destination);

      this.reverbInputGain = buildReverbChain(
        this.context,
        this.masterGain,
        createImpulseResponse(this.context),
        REVERB_WET_GAIN,
      );

      this.delayInputGain = buildDelayChain(
        this.context,
        this.masterGain,
        DELAY_TIME_S,
        DELAY_FILTER_FREQ_HZ,
        DELAY_FEEDBACK_GAIN,
        DELAY_WET_GAIN,
        DELAY_MAX_TIME_S,
      );
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    return this.context;
  }

  private getLoopOffset(
    track: TrackDefinition,
    trackState: TrackState,
    globalTempo: number,
  ): number {
    if (!this.context) {
      return 0;
    }

    const elapsed = Math.max(
      0,
      this.context.currentTime - this.transportStartTime,
    );
    const rate = getEffectiveRate(trackState, globalTempo);

    if (track.kind === 'custom') {
      return 0;
    }

    return (elapsed * rate) % track.loopLengthSeconds;
  }

  private async getBuffer(
    track: TrackDefinition,
    customSounds: CustomSoundRecord[],
  ): Promise<AudioBuffer | null> {
    const context = await this.ensureContext();

    return resolveTrackBuffer(
      context,
      track,
      customSounds,
      this.demoBufferCache,
      this.customBufferCache,
    );
  }

  private createHandle(
    trackId: string,
    buffer: AudioBuffer,
    trackState: TrackState,
    globalTempo: number,
    oneShot: boolean,
  ): PlaybackHandle {
    if (!this.context || !this.masterGain) {
      throw new Error('Audio context is not ready.');
    }

    return createPlaybackHandle(
      this.context,
      this.masterGain,
      this.reverbInputGain,
      this.delayInputGain,
      trackId,
      buffer,
      trackState,
      getEffectiveRate(trackState, globalTempo),
      oneShot,
    );
  }

  private async startLoopTrack(
    track: TrackDefinition,
    trackState: TrackState,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
    alignToTransport = false,
  ): Promise<void> {
    const context = await this.ensureContext();
    const buffer = await this.getBuffer(track, customSounds);

    if (!buffer || !this.masterGain) {
      return;
    }

    const handle = this.createHandle(
      track.id,
      buffer,
      trackState,
      globalTempo,
      false,
    );
    const startTime = context.currentTime + LOOP_START_LOOKAHEAD_S;
    const offset = alignToTransport
      ? this.getLoopOffset(track, trackState, globalTempo)
      : 0;
    handle.source.start(startTime, offset);
    registerHandle(handle, this.activeHandles, this.playbackListeners);
  }

  private async startOneShotTrack(
    track: TrackDefinition,
    trackState: TrackState,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
  ): Promise<void> {
    const context = await this.ensureContext();
    const buffer = await this.getBuffer(track, customSounds);

    if (!buffer || !this.masterGain) {
      return;
    }

    const handle = this.createHandle(
      track.id,
      buffer,
      trackState,
      globalTempo,
      true,
    );
    handle.source.loop = false;
    handle.source.start(context.currentTime + ONESHOT_START_LOOKAHEAD_S, 0);
    registerHandle(handle, this.activeHandles, this.playbackListeners);
  }

  private async fadeMaster(
    target: number,
    durationMs = FADE_MS,
  ): Promise<void> {
    if (!this.masterGain || !this.context) {
      return;
    }

    const startValue = this.masterGain.gain.value;
    const endValue = clamp(target, 0, 1);
    const startTime = this.context.currentTime;
    const endTime = startTime + durationMs / 1000;

    this.masterGain.gain.cancelScheduledValues(startTime);
    this.masterGain.gain.setValueAtTime(startValue, startTime);
    this.masterGain.gain.linearRampToValueAtTime(endValue, endTime);
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, durationMs);
    });
  }

  async stopTransport(fadeOut = true): Promise<void> {
    if (fadeOut) {
      await this.fadeMaster(0);
    }

    const trackIds = Array.from(this.activeHandles.keys());
    trackIds.forEach((trackId) => {
      stopTrackHandles(trackId, this.activeHandles, this.playbackListeners);
    });

    this.transportActive = false;
    if (this.masterGain) {
      this.masterGain.gain.value = 1;
    }
  }

  /**
   * Starts transport for every enabled track.
   *
   * @param offsetSeconds Position within the arrangement at which to begin.
   * The transport clock is backdated by this amount so each loop starts at the
   * phase it would occupy had playback begun from zero this many seconds ago.
   * Used to scrub set playback so loop transitions are auditioned exactly as
   * they will sound when the set runs from the start. Defaults to 0 (loop
   * phase zero — identical to the previous behaviour).
   */
  async startTransport(
    tracks: TrackDefinition[],
    trackStates: Record<string, TrackState>,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
    offsetSeconds = 0,
  ): Promise<void> {
    const context = await this.ensureContext();
    await this.stopTransport(false);
    this.transportActive = true;
    this.transportStartTime = context.currentTime - offsetSeconds;

    await Promise.all(
      tracks
        .filter((track) => trackStates[track.id]?.enabled)
        .map((track) =>
          this.startLoopTrack(
            track,
            trackStates[track.id],
            customSounds,
            globalTempo,
            offsetSeconds > 0,
          ),
        ),
    );

    await this.fadeMaster(1, FADE_IN_MS);
  }

  async restartTransport(
    tracks: TrackDefinition[],
    trackStates: Record<string, TrackState>,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
  ): Promise<void> {
    await this.startTransport(tracks, trackStates, customSounds, globalTempo);
  }

  async playTrackOnce(
    track: TrackDefinition,
    trackState: TrackState,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
  ): Promise<'started' | 'stopped'> {
    const previewIsPlaying = derivePlaybackState(
      this.activeHandles.get(track.id),
    ).isPreviewPlaying;

    if (previewIsPlaying) {
      stopTrackHandles(
        track.id,
        this.activeHandles,
        this.playbackListeners,
        (handle) => handle.oneShot,
      );

      return 'stopped';
    }

    const trackIds = Array.from(this.activeHandles.keys());
    trackIds.forEach((trackId) => {
      stopTrackHandles(
        trackId,
        this.activeHandles,
        this.playbackListeners,
        (handle) => handle.oneShot,
      );
    });

    await this.startOneShotTrack(track, trackState, customSounds, globalTempo);

    return 'started';
  }

  async syncTrack(
    track: TrackDefinition,
    trackState: TrackState,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
  ): Promise<void> {
    if (!trackState.enabled) {
      stopTrackHandles(track.id, this.activeHandles, this.playbackListeners);

      return;
    }

    if (!this.transportActive) {
      return;
    }

    stopTrackHandles(track.id, this.activeHandles, this.playbackListeners);
    await this.startLoopTrack(
      track,
      trackState,
      customSounds,
      globalTempo,
      true,
    );
  }

  updateTrackVolume(trackId: string, volume: number): void {
    updateTrackHandles(trackId, this.activeHandles, (handle) => {
      handle.gainNode.gain.setTargetAtTime(
        volume,
        this.context?.currentTime ?? 0,
        VOLUME_TIME_CONSTANT,
      );
    });
  }

  updateTrackRate(trackId: string, rate: number): void {
    updateTrackHandles(trackId, this.activeHandles, (handle) => {
      handle.source.playbackRate.setTargetAtTime(
        rate,
        this.context?.currentTime ?? 0,
        RATE_TIME_CONSTANT,
      );
    });
  }

  updateTrackEq(
    trackId: string,
    eqLow: number,
    eqMid: number,
    eqHigh: number,
  ): void {
    updateTrackHandles(trackId, this.activeHandles, (handle) => {
      handle.eqLowNode.gain.setTargetAtTime(
        eqLow,
        this.context?.currentTime ?? 0,
        EQ_TIME_CONSTANT,
      );
      handle.eqMidNode.gain.setTargetAtTime(
        eqMid,
        this.context?.currentTime ?? 0,
        EQ_TIME_CONSTANT,
      );
      handle.eqHighNode.gain.setTargetAtTime(
        eqHigh,
        this.context?.currentTime ?? 0,
        EQ_TIME_CONSTANT,
      );
    });
  }

  updateTrackEffects(
    trackId: string,
    reverbSend: number,
    delaySend: number,
  ): void {
    updateTrackHandles(trackId, this.activeHandles, (handle) => {
      handle.reverbSendNode.gain.setTargetAtTime(
        reverbSend,
        this.context?.currentTime ?? 0,
        EFFECT_TIME_CONSTANT,
      );
      handle.delaySendNode.gain.setTargetAtTime(
        delaySend,
        this.context?.currentTime ?? 0,
        EFFECT_TIME_CONSTANT,
      );
    });
  }

  setTransportClock(startTime: number): void {
    this.transportStartTime = startTime;
  }

  subscribeToPlayback(listener: PlaybackListener): () => void {
    this.playbackListeners.add(listener);

    return () => {
      this.playbackListeners.delete(listener);
    };
  }

  async prepareContext(): Promise<void> {
    await this.ensureContext();
  }
}

/** Re-exported snapshot type for consumers that only need the mixer state shape. */
export type { MixerSnapshot };
