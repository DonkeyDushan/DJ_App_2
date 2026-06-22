/**
 * Core audio engine — manages Web Audio API context, playback handles,
 * transport lifecycle, and real-time parameter updates.
 */

import type { TrackDefinition, TrackState } from '../types/trackData';
import type { CustomSoundRecord, MixerSnapshot } from '../types/mixData';
import type { TransitionKind } from '../types/transition';
import { createImpulseResponse } from './synthesis';
import type {
  PlaybackDeck,
  PlaybackListener,
  PlaybackState,
  PlaybackHandle,
} from './audioTypes';
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
  TRANSITION_STOP_GUARD_MS,
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

const getEffectiveRate = (
  trackState: TrackState,
  globalTempo: number,
): number => (trackState.followsGlobalTempo ? globalTempo : trackState.speed);

export class AudioEngine {
  private context: AudioContext | null = null;

  private masterGain: GainNode | null = null;

  private reverbInputGain: GainNode | null = null;

  private delayInputGain: GainNode | null = null;

  private transportActive = false;

  /**
   * Two playback decks. The foreground deck carries the audible mix; the other
   * is idle until a fade/crossfade brings an incoming mix in on it.
   */
  private decks: readonly [PlaybackDeck, PlaybackDeck] = [
    { gain: null, handles: new Map(), startTime: 0 },
    { gain: null, handles: new Map(), startTime: 0 },
  ];

  private foregroundDeckIndex = 0;

  /**
   * Monotonic token invalidating in-flight transitions. Bumped whenever a new
   * transition starts or transport stops, so a scheduled second phase (fade) or
   * outgoing-deck stop (crossfade) is skipped if state has since moved on.
   */
  private transitionToken = 0;

  private demoBufferCache = new Map<string, AudioBuffer>();

  private customBufferCache = new Map<string, AudioBuffer>();

  private playbackListeners = new Set<PlaybackListener>();

  /**
   * Empty listener set used for background-deck handle changes so the outgoing
   * mix's start/stop never emits playback-state events for tracks that the
   * foreground (incoming) mix may still be playing.
   */
  private readonly silentListeners = new Set<PlaybackListener>();

  private get foregroundDeck(): PlaybackDeck {
    return this.decks[this.foregroundDeckIndex];
  }

  private get backgroundDeck(): PlaybackDeck {
    return this.decks[this.foregroundDeckIndex === 0 ? 1 : 0];
  }

  async ensureContext(): Promise<AudioContext> {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.context.destination);

      // Each deck's fader sits between its track handles and the master output,
      // so a deck can be faded as a whole without touching per-track volumes.
      this.decks.forEach((deck) => {
        if (!this.context || !this.masterGain) return;
        const gain = this.context.createGain();
        gain.gain.value = 1;
        gain.connect(this.masterGain);
        deck.gain = gain;
      });

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
    startTime: number,
  ): number {
    if (!this.context) {
      return 0;
    }

    const elapsed = Math.max(0, this.context.currentTime - startTime);
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
    targetGain: GainNode,
  ): PlaybackHandle {
    if (!this.context) {
      throw new Error('Audio context is not ready.');
    }

    return createPlaybackHandle(
      this.context,
      targetGain,
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
    deck: PlaybackDeck,
    listeners: Set<PlaybackListener>,
    alignToTransport = false,
  ): Promise<void> {
    const context = await this.ensureContext();
    const buffer = await this.getBuffer(track, customSounds);

    if (!buffer || !deck.gain) {
      return;
    }

    const handle = this.createHandle(
      track.id,
      buffer,
      trackState,
      globalTempo,
      false,
      deck.gain,
    );
    const startTime = context.currentTime + LOOP_START_LOOKAHEAD_S;
    const offset = alignToTransport
      ? this.getLoopOffset(track, trackState, globalTempo, deck.startTime)
      : 0;
    handle.source.start(startTime, offset);
    registerHandle(handle, deck.handles, listeners);
  }

  private async startOneShotTrack(
    track: TrackDefinition,
    trackState: TrackState,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
  ): Promise<void> {
    const context = await this.ensureContext();
    const buffer = await this.getBuffer(track, customSounds);
    const deck = this.foregroundDeck;

    if (!buffer || !deck.gain) {
      return;
    }

    const handle = this.createHandle(
      track.id,
      buffer,
      trackState,
      globalTempo,
      true,
      deck.gain,
    );
    handle.source.loop = false;
    handle.source.start(context.currentTime + ONESHOT_START_LOOKAHEAD_S, 0);
    registerHandle(handle, deck.handles, this.playbackListeners);
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
    // Invalidate any in-flight transition so its scheduled phases are skipped.
    this.transitionToken += 1;

    if (fadeOut) {
      await this.fadeMaster(0);
    }

    this.decks.forEach((deck, index) => {
      const listeners =
        index === this.foregroundDeckIndex
          ? this.playbackListeners
          : this.silentListeners;
      Array.from(deck.handles.keys()).forEach((trackId) => {
        stopTrackHandles(trackId, deck.handles, listeners);
      });
      if (deck.gain) {
        deck.gain.gain.cancelScheduledValues(this.context?.currentTime ?? 0);
        deck.gain.gain.value = 1;
      }
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

    const deck = this.foregroundDeck;
    deck.startTime = context.currentTime - offsetSeconds;

    await Promise.all(
      tracks
        .filter((track) => trackStates[track.id]?.enabled)
        .map((track) =>
          this.startLoopTrack(
            track,
            trackStates[track.id],
            customSounds,
            globalTempo,
            deck,
            this.playbackListeners,
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

  /** Linearly ramps a deck's fader from its current value to `target`. */
  private rampDeckGain(
    deck: PlaybackDeck,
    target: number,
    durationSeconds: number,
  ): void {
    if (!deck.gain || !this.context) {
      return;
    }

    const startTime = this.context.currentTime;
    const startValue = deck.gain.gain.value;

    deck.gain.gain.cancelScheduledValues(startTime);
    deck.gain.gain.setValueAtTime(startValue, startTime);
    deck.gain.gain.linearRampToValueAtTime(
      clamp(target, 0, 1),
      startTime + durationSeconds,
    );
  }

  /** Stops every handle on a background deck without emitting UI events. */
  private stopBackgroundDeck(deck: PlaybackDeck): void {
    Array.from(deck.handles.keys()).forEach((trackId) => {
      stopTrackHandles(trackId, deck.handles, this.silentListeners);
    });
    if (deck.gain) {
      deck.gain.gain.cancelScheduledValues(this.context?.currentTime ?? 0);
      deck.gain.gain.value = 1;
    }
  }

  /** Starts a mix's enabled loops on a deck, aligned to that deck's clock. */
  private async startDeckLoops(
    deck: PlaybackDeck,
    tracks: TrackDefinition[],
    trackStates: Record<string, TrackState>,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
    listeners: Set<PlaybackListener>,
    aligned: boolean,
  ): Promise<void> {
    await Promise.all(
      tracks
        .filter((track) => trackStates[track.id]?.enabled)
        .map((track) =>
          this.startLoopTrack(
            track,
            trackStates[track.id],
            customSounds,
            globalTempo,
            deck,
            listeners,
            aligned,
          ),
        ),
    );
  }

  /**
   * Transitions from the currently playing mix to an incoming one.
   *
   * - `cut`: stops the current mix and starts the incoming one (a short master
   *   fade guards against clicks) — identical to a plain mix (re)load.
   * - `fade`: fades the outgoing deck to silence over half the duration, then
   *   starts the incoming mix on the idle deck and fades it up over the other
   *   half. The two never overlap.
   * - `crossfade`: starts the incoming mix on the idle deck and ramps the two
   *   decks past each other over the full duration so they overlap.
   *
   * For `fade`/`crossfade` the incoming deck becomes the foreground deck
   * immediately, so live mixer edits and playback-state events follow the mix
   * that will remain. `offsetSeconds` backdates the incoming deck's clock so
   * its loops start at the phase they would occupy live.
   */
  async crossfadeTo(
    tracks: TrackDefinition[],
    trackStates: Record<string, TrackState>,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
    options: {
      kind: TransitionKind;
      durationSeconds: number;
      offsetSeconds: number;
    },
  ): Promise<void> {
    const { kind, durationSeconds, offsetSeconds } = options;

    // A cut, or starting from a stopped transport, is a plain (re)load.
    if (kind === 'cut' || !this.transportActive || durationSeconds <= 0) {
      if (this.transportActive) {
        await this.stopTransport(true);
      }
      await this.startTransport(
        tracks,
        trackStates,
        customSounds,
        globalTempo,
        offsetSeconds,
      );

      return;
    }

    const context = await this.ensureContext();
    this.transitionToken += 1;
    const token = this.transitionToken;
    const outgoing = this.foregroundDeck;
    const incoming = this.backgroundDeck;

    // The incoming mix is the one that survives — it becomes foreground now so
    // live edits and UI events target it.
    this.foregroundDeckIndex = this.foregroundDeckIndex === 0 ? 1 : 0;

    if (kind === 'crossfade') {
      incoming.startTime = context.currentTime - offsetSeconds;
      if (incoming.gain) incoming.gain.gain.value = 0;
      await this.startDeckLoops(
        incoming,
        tracks,
        trackStates,
        customSounds,
        globalTempo,
        this.playbackListeners,
        offsetSeconds > 0,
      );

      // A stop/transition during the buffer-load above invalidates this run;
      // tear down the loops we just started so they do not leak.
      if (token !== this.transitionToken) {
        this.stopBackgroundDeck(incoming);

        return;
      }

      this.rampDeckGain(outgoing, 0, durationSeconds);
      this.rampDeckGain(incoming, 1, durationSeconds);

      window.setTimeout(() => {
        if (token !== this.transitionToken) return;
        this.stopBackgroundDeck(outgoing);
      }, durationSeconds * 1000 + TRANSITION_STOP_GUARD_MS);

      return;
    }

    // kind === 'fade': sequential fade through silence.
    const halfSeconds = durationSeconds / 2;
    this.rampDeckGain(outgoing, 0, halfSeconds);

    window.setTimeout(() => {
      if (token !== this.transitionToken) return;
      void (async () => {
        const ctx = this.context;
        if (!ctx) return;

        this.stopBackgroundDeck(outgoing);
        incoming.startTime = ctx.currentTime - offsetSeconds;
        if (incoming.gain) incoming.gain.gain.value = 0;
        await this.startDeckLoops(
          incoming,
          tracks,
          trackStates,
          customSounds,
          globalTempo,
          this.playbackListeners,
          offsetSeconds > 0,
        );

        if (token !== this.transitionToken) {
          this.stopBackgroundDeck(incoming);

          return;
        }

        this.rampDeckGain(incoming, 1, halfSeconds);
      })();
    }, halfSeconds * 1000);
  }

  async playTrackOnce(
    track: TrackDefinition,
    trackState: TrackState,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
  ): Promise<'started' | 'stopped'> {
    const deck = this.foregroundDeck;
    const previewIsPlaying = derivePlaybackState(
      deck.handles.get(track.id),
    ).isPreviewPlaying;

    if (previewIsPlaying) {
      stopTrackHandles(
        track.id,
        deck.handles,
        this.playbackListeners,
        (handle) => handle.oneShot,
      );

      return 'stopped';
    }

    const trackIds = Array.from(deck.handles.keys());
    trackIds.forEach((trackId) => {
      stopTrackHandles(
        trackId,
        deck.handles,
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
    const deck = this.foregroundDeck;

    if (!trackState.enabled) {
      stopTrackHandles(track.id, deck.handles, this.playbackListeners);

      return;
    }

    if (!this.transportActive) {
      return;
    }

    stopTrackHandles(track.id, deck.handles, this.playbackListeners);
    await this.startLoopTrack(
      track,
      trackState,
      customSounds,
      globalTempo,
      deck,
      this.playbackListeners,
      true,
    );
  }

  updateTrackVolume(trackId: string, volume: number): void {
    updateTrackHandles(trackId, this.foregroundDeck.handles, (handle) => {
      handle.gainNode.gain.setTargetAtTime(
        volume,
        this.context?.currentTime ?? 0,
        VOLUME_TIME_CONSTANT,
      );
    });
  }

  updateTrackRate(trackId: string, rate: number): void {
    updateTrackHandles(trackId, this.foregroundDeck.handles, (handle) => {
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
    updateTrackHandles(trackId, this.foregroundDeck.handles, (handle) => {
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
    updateTrackHandles(trackId, this.foregroundDeck.handles, (handle) => {
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
    this.foregroundDeck.startTime = startTime;
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
