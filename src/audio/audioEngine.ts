import type { CustomSoundRecord, TrackDefinition, TrackState } from '../types';
import { createDemoBuffer, createImpulseResponse } from './synthesis';

type PlaybackHandle = {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  eqLowNode: BiquadFilterNode;
  eqMidNode: BiquadFilterNode;
  eqHighNode: BiquadFilterNode;
  reverbSendNode: GainNode;
  delaySendNode: GainNode;
  trackId: string;
  oneShot: boolean;
};

type PlaybackState = {
  isPlaying: boolean;
  isPreviewPlaying: boolean;
};

const FADE_MS = 180;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getEffectiveRate(trackState: TrackState, globalTempo: number): number {
  return trackState.followsGlobalTempo ? globalTempo : trackState.speed;
}

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

  private playbackListeners = new Set<
    (trackId: string, playbackState: PlaybackState) => void
  >();

  private async loadPreloadedDemoTrackBuffer(
    track: TrackDefinition,
  ): Promise<AudioBuffer | null> {
    if (!track.preloadedSrc) {
      return null;
    }

    const context = await this.ensureContext();

    try {
      const response = await fetch(track.preloadedSrc);
      if (!response.ok) {
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return await context.decodeAudioData(arrayBuffer);
    } catch {
      return null;
    }
  }

  async ensureContext(): Promise<AudioContext> {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.context.destination);

      const reverbInputGain = this.context.createGain();
      const reverbWetGain = this.context.createGain();
      const convolver = this.context.createConvolver();
      convolver.buffer = createImpulseResponse(this.context);
      reverbInputGain.gain.value = 1;
      reverbWetGain.gain.value = 0.9;
      reverbInputGain.connect(convolver);
      convolver.connect(reverbWetGain).connect(this.masterGain);
      this.reverbInputGain = reverbInputGain;

      const delayInputGain = this.context.createGain();
      const delayNode = this.context.createDelay(1.2);
      const delayFilter = this.context.createBiquadFilter();
      const delayFeedbackGain = this.context.createGain();
      const delayWetGain = this.context.createGain();
      delayInputGain.gain.value = 1;
      delayNode.delayTime.value = 0.28;
      delayFilter.type = 'lowpass';
      delayFilter.frequency.value = 4200;
      delayFeedbackGain.gain.value = 0.34;
      delayWetGain.gain.value = 0.8;
      delayInputGain.connect(delayNode);
      delayNode.connect(delayFilter);
      delayFilter.connect(delayWetGain).connect(this.masterGain);
      delayFilter.connect(delayFeedbackGain).connect(delayNode);
      this.delayInputGain = delayInputGain;
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

  private registerHandle(handle: PlaybackHandle): void {
    const set =
      this.activeHandles.get(handle.trackId) ?? new Set<PlaybackHandle>();
    set.add(handle);
    this.activeHandles.set(handle.trackId, set);
    this.emitTrackPlaybackState(handle.trackId);

    handle.source.onended = () => {
      const handles = this.activeHandles.get(handle.trackId);
      handles?.delete(handle);
      if (handles && handles.size === 0) {
        this.activeHandles.delete(handle.trackId);
      }
      handle.source.disconnect();
      handle.gainNode.disconnect();
      handle.eqLowNode.disconnect();
      handle.eqMidNode.disconnect();
      handle.eqHighNode.disconnect();
      handle.reverbSendNode.disconnect();
      handle.delaySendNode.disconnect();
      this.emitTrackPlaybackState(handle.trackId);
    };
  }

  private getTrackPlaybackState(trackId: string): PlaybackState {
    const handles = this.activeHandles.get(trackId);
    if (!handles || handles.size === 0) {
      return {
        isPlaying: false,
        isPreviewPlaying: false,
      };
    }

    const isPreviewPlaying = Array.from(handles).some(
      (handle) => handle.oneShot,
    );
    return {
      isPlaying: true,
      isPreviewPlaying,
    };
  }

  private emitTrackPlaybackState(trackId: string): void {
    const playbackState = this.getTrackPlaybackState(trackId);
    this.playbackListeners.forEach((listener) =>
      listener(trackId, playbackState),
    );
  }

  private async decodeCustomSound(
    record: CustomSoundRecord,
  ): Promise<AudioBuffer> {
    const cached = this.customBufferCache.get(record.id);
    if (cached) {
      return cached;
    }

    const context = await this.ensureContext();
    const buffer = await context.decodeAudioData(
      await record.blob.arrayBuffer(),
    );
    this.customBufferCache.set(record.id, buffer);
    return buffer;
  }

  private async getBuffer(
    track: TrackDefinition,
    customSounds: CustomSoundRecord[],
  ): Promise<AudioBuffer | null> {
    const context = await this.ensureContext();

    if (track.kind === 'demo') {
      const cached = this.demoBufferCache.get(track.id);
      if (cached) {
        return cached;
      }

      const preloadedBuffer = await this.loadPreloadedDemoTrackBuffer(track);
      if (preloadedBuffer) {
        this.demoBufferCache.set(track.id, preloadedBuffer);
        return preloadedBuffer;
      }

      const fallbackBuffer = createDemoBuffer(context, track.id);
      this.demoBufferCache.set(track.id, fallbackBuffer);
      return fallbackBuffer;
    }

    const sound = customSounds.find(
      (entry) => entry.id === track.customSoundId,
    );
    if (!sound) {
      return null;
    }

    return this.decodeCustomSound(sound);
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

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    const eqLowNode = this.context.createBiquadFilter();
    const eqMidNode = this.context.createBiquadFilter();
    const eqHighNode = this.context.createBiquadFilter();
    const reverbSendNode = this.context.createGain();
    const delaySendNode = this.context.createGain();

    eqLowNode.type = 'lowshelf';
    eqLowNode.frequency.value = 220;
    eqLowNode.gain.value = trackState.eqLow;

    eqMidNode.type = 'peaking';
    eqMidNode.frequency.value = 1200;
    eqMidNode.Q.value = 0.9;
    eqMidNode.gain.value = trackState.eqMid;

    eqHighNode.type = 'highshelf';
    eqHighNode.frequency.value = 4200;
    eqHighNode.gain.value = trackState.eqHigh;

    reverbSendNode.gain.value = trackState.reverbSend;
    delaySendNode.gain.value = trackState.delaySend;

    source.buffer = buffer;
    source.loop = !oneShot;
    source.playbackRate.value = getEffectiveRate(trackState, globalTempo);
    gainNode.gain.value = trackState.volume;
    source.connect(eqLowNode);
    eqLowNode.connect(eqMidNode);
    eqMidNode.connect(eqHighNode);
    eqHighNode.connect(gainNode);

    gainNode.connect(this.masterGain);

    if (this.reverbInputGain) {
      gainNode.connect(reverbSendNode).connect(this.reverbInputGain);
    }

    if (this.delayInputGain) {
      gainNode.connect(delaySendNode).connect(this.delayInputGain);
    }

    return {
      source,
      gainNode,
      eqLowNode,
      eqMidNode,
      eqHighNode,
      reverbSendNode,
      delaySendNode,
      trackId,
      oneShot,
    };
  }

  private updateTrackHandles(
    trackId: string,
    updater: (handle: PlaybackHandle) => void,
  ): void {
    const handles = this.activeHandles.get(trackId);
    if (!handles) {
      return;
    }

    handles.forEach(updater);
  }

  private stopTrackHandles(
    trackId: string,
    shouldStop: (handle: PlaybackHandle) => boolean = () => true,
  ): void {
    const handles = this.activeHandles.get(trackId);
    if (!handles) {
      return;
    }

    Array.from(handles).forEach((handle) => {
      if (!shouldStop(handle)) {
        return;
      }

      handles.delete(handle);
      handle.source.onended = null;
      try {
        handle.source.stop();
      } catch {
        // Ignore double-stop races.
      }
      handle.source.disconnect();
      handle.gainNode.disconnect();
      handle.eqLowNode.disconnect();
      handle.eqMidNode.disconnect();
      handle.eqHighNode.disconnect();
      handle.reverbSendNode.disconnect();
      handle.delaySendNode.disconnect();
    });

    if (handles.size === 0) {
      this.activeHandles.delete(trackId);
    }

    this.emitTrackPlaybackState(trackId);
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
    const startTime = context.currentTime + 0.04;
    const offset = alignToTransport
      ? this.getLoopOffset(track, trackState, globalTempo)
      : 0;
    handle.source.start(startTime, offset);
    this.registerHandle(handle);
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
    handle.source.start(context.currentTime + 0.02, 0);
    this.registerHandle(handle);
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
      this.stopTrackHandles(trackId);
    });

    this.transportActive = false;
    if (this.masterGain) {
      this.masterGain.gain.value = 1;
    }
  }

  async startTransport(
    tracks: TrackDefinition[],
    trackStates: Record<string, TrackState>,
    customSounds: CustomSoundRecord[],
    globalTempo: number,
  ): Promise<void> {
    await this.ensureContext();
    await this.stopTransport(false);
    this.transportActive = true;
    this.transportStartTime = this.context?.currentTime ?? 0;

    await Promise.all(
      tracks
        .filter((track) => trackStates[track.id]?.enabled)
        .map((track) =>
          this.startLoopTrack(track, trackStates[track.id], customSounds, globalTempo, false),
        ),
    );

    await this.fadeMaster(1, 220);
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
    const previewIsPlaying = this.getTrackPlaybackState(
      track.id,
    ).isPreviewPlaying;
    if (previewIsPlaying) {
      this.stopTrackHandles(track.id, (handle) => handle.oneShot);
      return 'stopped';
    }

    const trackIds = Array.from(this.activeHandles.keys());
    trackIds.forEach((trackId) => {
      this.stopTrackHandles(trackId, (handle) => handle.oneShot);
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
      this.stopTrackHandles(track.id);
      return;
    }

    if (!this.transportActive) {
      return;
    }

    this.stopTrackHandles(track.id);
    await this.startLoopTrack(
      track,
      trackState,
      customSounds,
      globalTempo,
      true,
    );
  }

  updateTrackVolume(trackId: string, volume: number): void {
    this.updateTrackHandles(trackId, (handle) => {
      handle.gainNode.gain.setTargetAtTime(
        volume,
        this.context?.currentTime ?? 0,
        0.015,
      );
    });
  }

  updateTrackRate(trackId: string, rate: number): void {
    this.updateTrackHandles(trackId, (handle) => {
      handle.source.playbackRate.setTargetAtTime(
        rate,
        this.context?.currentTime ?? 0,
        0.02,
      );
    });
  }

  updateTrackEq(
    trackId: string,
    eqLow: number,
    eqMid: number,
    eqHigh: number,
  ): void {
    this.updateTrackHandles(trackId, (handle) => {
      handle.eqLowNode.gain.setTargetAtTime(
        eqLow,
        this.context?.currentTime ?? 0,
        0.03,
      );
      handle.eqMidNode.gain.setTargetAtTime(
        eqMid,
        this.context?.currentTime ?? 0,
        0.03,
      );
      handle.eqHighNode.gain.setTargetAtTime(
        eqHigh,
        this.context?.currentTime ?? 0,
        0.03,
      );
    });
  }

  updateTrackEffects(
    trackId: string,
    reverbSend: number,
    delaySend: number,
  ): void {
    this.updateTrackHandles(trackId, (handle) => {
      handle.reverbSendNode.gain.setTargetAtTime(
        reverbSend,
        this.context?.currentTime ?? 0,
        0.03,
      );
      handle.delaySendNode.gain.setTargetAtTime(
        delaySend,
        this.context?.currentTime ?? 0,
        0.03,
      );
    });
  }

  setTransportClock(startTime: number): void {
    this.transportStartTime = startTime;
  }

  subscribeToPlayback(
    listener: (trackId: string, playbackState: PlaybackState) => void,
  ): () => void {
    this.playbackListeners.add(listener);

    return () => {
      this.playbackListeners.delete(listener);
    };
  }

  async prepareContext(): Promise<void> {
    await this.ensureContext();
  }
}
