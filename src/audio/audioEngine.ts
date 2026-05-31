import type { CustomSoundRecord, TrackDefinition, TrackState } from '../types';

type PlaybackHandle = {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  trackId: string;
  oneShot: boolean;
};

const FADE_MS = 180;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getEffectiveRate(trackState: TrackState, globalTempo: number): number {
  return trackState.followsGlobalTempo ? globalTempo : trackState.speed;
}

function envelopeValue(positionSeconds: number, attack: number, decay: number): number {
  if (positionSeconds < 0 || positionSeconds > attack + decay) {
    return 0;
  }

  if (positionSeconds <= attack) {
    return positionSeconds / Math.max(attack, 0.0001);
  }

  return 1 - (positionSeconds - attack) / Math.max(decay, 0.0001);
}

function addSinePulse(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  startTime: number,
  durationSeconds: number,
  frequency: number,
  volume: number,
  pan = 0,
  decay = 2.2,
): void {
  const startIndex = Math.max(0, Math.floor(startTime * sampleRate));
  const endIndex = Math.min(left.length, Math.floor((startTime + durationSeconds) * sampleRate));

  for (let index = startIndex; index < endIndex; index += 1) {
    const time = index / sampleRate - startTime;
    const env = volume * Math.exp(-time * decay) * envelopeValue(time, 0.01, durationSeconds);
    const wave = Math.sin(2 * Math.PI * frequency * time);
    const leftGain = 1 - Math.max(0, pan);
    const rightGain = 1 + Math.min(0, pan);
    left[index] += wave * env * leftGain;
    right[index] += wave * env * rightGain;
  }
}

function addSawPulse(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  startTime: number,
  durationSeconds: number,
  frequency: number,
  volume: number,
  pan = 0,
  decay = 1.7,
): void {
  const startIndex = Math.max(0, Math.floor(startTime * sampleRate));
  const endIndex = Math.min(left.length, Math.floor((startTime + durationSeconds) * sampleRate));

  for (let index = startIndex; index < endIndex; index += 1) {
    const time = index / sampleRate - startTime;
    const env = volume * Math.exp(-time * decay) * envelopeValue(time, 0.005, durationSeconds);
    const phase = (time * frequency) % 1;
    const wave = phase * 2 - 1;
    const leftGain = 1 - Math.max(0, pan);
    const rightGain = 1 + Math.min(0, pan);
    left[index] += wave * env * leftGain;
    right[index] += wave * env * rightGain;
  }
}

function addNoiseBurst(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  startTime: number,
  durationSeconds: number,
  volume: number,
  pan = 0,
  decay = 3.8,
): void {
  const startIndex = Math.max(0, Math.floor(startTime * sampleRate));
  const endIndex = Math.min(left.length, Math.floor((startTime + durationSeconds) * sampleRate));

  for (let index = startIndex; index < endIndex; index += 1) {
    const time = index / sampleRate - startTime;
    const env = volume * Math.exp(-time * decay) * envelopeValue(time, 0.002, durationSeconds);
    const noise = Math.sin((index + 17) * 12.9898) * Math.cos((index + 33) * 78.233);
    const value = (noise % 1) * 2 - 1;
    const leftGain = 1 - Math.max(0, pan);
    const rightGain = 1 + Math.min(0, pan);
    left[index] += value * env * leftGain;
    right[index] += value * env * rightGain;
  }
}

function addChordPad(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  startTime: number,
  durationSeconds: number,
  rootFrequency: number,
  volume: number,
): void {
  const chord = [1, 1.25, 1.5, 2].map((multiplier) => rootFrequency * multiplier);
  chord.forEach((frequency, chordIndex) => {
    addSinePulse(
      left,
      right,
      sampleRate,
      startTime,
      durationSeconds,
      frequency,
      volume * (chordIndex === 0 ? 0.35 : 0.18),
      chordIndex % 2 === 0 ? -0.12 : 0.12,
      0.7,
    );
  });
}

function createDemoBuffer(context: AudioContext, trackId: string): AudioBuffer {
  const durationSeconds = 8;
  const { sampleRate } = context;
  const buffer = context.createBuffer(2, Math.floor(durationSeconds * sampleRate), sampleRate);
  const [left, right] = [buffer.getChannelData(0), buffer.getChannelData(1)];
  const beat = 60 / 120;
  const step = beat / 2;

  if (trackId === 'drums') {
    for (let beatIndex = 0; beatIndex < 16; beatIndex += 1) {
      const time = beatIndex * beat;
      if (beatIndex % 4 === 0) {
        addSinePulse(left, right, sampleRate, time, 0.24, 56, 0.95, 0, 6);
      }
      if (beatIndex % 4 === 2) {
        addNoiseBurst(left, right, sampleRate, time + 0.02, 0.14, 0.65, 0, 7);
        addSinePulse(left, right, sampleRate, time, 0.18, 180, 0.26, 0, 8);
      }
    }

    for (let stepIndex = 0; stepIndex < 32; stepIndex += 1) {
      addNoiseBurst(left, right, sampleRate, stepIndex * step, 0.035, 0.16, 0, 12);
    }

    return buffer;
  }

  if (trackId === 'bass') {
    const notes = [55, 55, 65.41, 49, 55, 73.42, 65.41, 49];
    notes.forEach((frequency, index) => {
      const time = index * beat * 2;
      addSawPulse(left, right, sampleRate, time, 1.25, frequency, 0.8, -0.08, 2.2);
      addSinePulse(left, right, sampleRate, time, 0.45, frequency / 2, 0.18, 0.05, 3.2);
    });

    return buffer;
  }

  if (trackId === 'keys') {
    const chords = [
      [261.63, 329.63, 392.0],
      [293.66, 369.99, 440.0],
      [246.94, 311.13, 392.0],
      [196.0, 246.94, 293.66],
    ];

    chords.forEach((chord, chordIndex) => {
      const time = chordIndex * 2 * beat;
      chord.forEach((frequency, noteIndex) => {
        addSinePulse(left, right, sampleRate, time, 1.9, frequency, 0.22, noteIndex === 0 ? -0.1 : 0.1, 0.9);
      });
      addChordPad(left, right, sampleRate, time, 1.85, chord[0], 0.18);
    });

    return buffer;
  }

  if (trackId === 'arp') {
    const scale = [392.0, 493.88, 587.33, 493.88, 440.0, 523.25, 659.25, 523.25];
    scale.forEach((frequency, index) => {
      const time = index * beat;
      addSinePulse(left, right, sampleRate, time, 0.28, frequency, 0.4, index % 2 === 0 ? -0.12 : 0.12, 4.5);
      addSinePulse(left, right, sampleRate, time + 0.08, 0.1, frequency * 2, 0.16, 0.05, 7.5);
    });

    return buffer;
  }

  const pads = [196.0, 174.61, 220.0, 146.83];
  pads.forEach((frequency, index) => {
    const time = index * 2 * beat;
    addChordPad(left, right, sampleRate, time, 2.4, frequency, 0.28);
    addSinePulse(left, right, sampleRate, time, 2.4, frequency * 0.5, 0.08, 0.04, 0.4);
  });

  return buffer;
}

export class AudioEngine {
  private context: AudioContext | null = null;

  private masterGain: GainNode | null = null;

  private transportStartTime = 0;

  private transportActive = false;

  private activeHandles = new Map<string, Set<PlaybackHandle>>();

  private demoBufferCache = new Map<string, AudioBuffer>();

  private customBufferCache = new Map<string, AudioBuffer>();

  private async loadPreloadedDemoTrackBuffer(track: TrackDefinition): Promise<AudioBuffer | null> {
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
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    return this.context;
  }

  private getLoopOffset(track: TrackDefinition, trackState: TrackState, globalTempo: number): number {
    if (!this.context) {
      return 0;
    }

    const elapsed = Math.max(0, this.context.currentTime - this.transportStartTime);
    const rate = getEffectiveRate(trackState, globalTempo);

    if (track.kind === 'custom') {
      return 0;
    }

    return elapsed * rate % track.loopLengthSeconds;
  }

  private registerHandle(handle: PlaybackHandle): void {
    const set = this.activeHandles.get(handle.trackId) ?? new Set<PlaybackHandle>();
    set.add(handle);
    this.activeHandles.set(handle.trackId, set);

    handle.source.onended = () => {
      const handles = this.activeHandles.get(handle.trackId);
      handles?.delete(handle);
      if (handles && handles.size === 0) {
        this.activeHandles.delete(handle.trackId);
      }
      handle.source.disconnect();
      handle.gainNode.disconnect();
    };
  }

  private async decodeCustomSound(record: CustomSoundRecord): Promise<AudioBuffer> {
    const cached = this.customBufferCache.get(record.id);
    if (cached) {
      return cached;
    }

    const context = await this.ensureContext();
    const buffer = await context.decodeAudioData(await record.blob.arrayBuffer());
    this.customBufferCache.set(record.id, buffer);
    return buffer;
  }

  private async getBuffer(track: TrackDefinition, customSounds: CustomSoundRecord[]): Promise<AudioBuffer | null> {
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

    const sound = customSounds.find((entry) => entry.id === track.customSoundId);
    if (!sound) {
      return null;
    }

    return this.decodeCustomSound(sound);
  }

  private createHandle(trackId: string, buffer: AudioBuffer, trackState: TrackState, globalTempo: number, oneShot: boolean): PlaybackHandle {
    if (!this.context || !this.masterGain) {
      throw new Error('Audio context is not ready.');
    }

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    source.buffer = buffer;
    source.loop = !oneShot;
    source.playbackRate.value = getEffectiveRate(trackState, globalTempo);
    gainNode.gain.value = trackState.volume;
    source.connect(gainNode).connect(this.masterGain);

    return {
      source,
      gainNode,
      trackId,
      oneShot,
    };
  }

  private updateTrackHandles(trackId: string, updater: (handle: PlaybackHandle) => void): void {
    const handles = this.activeHandles.get(trackId);
    if (!handles) {
      return;
    }

    handles.forEach(updater);
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

    const handle = this.createHandle(track.id, buffer, trackState, globalTempo, false);
    const startTime = context.currentTime + 0.04;
    const offset = alignToTransport ? this.getLoopOffset(track, trackState, globalTempo) : 0;
    handle.source.start(startTime, offset);
    this.registerHandle(handle);
    this.updateTrackPlayingFlag(track.id, true);
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

    const handle = this.createHandle(track.id, buffer, trackState, globalTempo, true);
    handle.source.loop = false;
    handle.source.start(context.currentTime + 0.02, 0);
    this.registerHandle(handle);
    this.updateTrackPlayingFlag(track.id, true);
  }

  private updateTrackPlayingFlag(trackId: string, isPlaying: boolean): void {
    this.updateTrackHandles(trackId, () => undefined);
    void isPlaying;
  }

  private async fadeMaster(target: number, durationMs = FADE_MS): Promise<void> {
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

  private stopTrackHandles(trackId: string): void {
    const handles = this.activeHandles.get(trackId);
    if (!handles) {
      return;
    }

    handles.forEach((handle) => {
      try {
        handle.source.stop();
      } catch {
        // Ignore double-stop races.
      }
    });

    this.activeHandles.delete(trackId);
  }

  async stopTransport(fadeOut = true): Promise<void> {
    if (fadeOut) {
      await this.fadeMaster(0);
    }

    this.activeHandles.forEach((handles) => {
      handles.forEach((handle) => {
        try {
          handle.source.stop();
        } catch {
          // Ignore double-stop races.
        }
      });
    });

    this.activeHandles.clear();
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

    for (const track of tracks) {
      const state = trackStates[track.id];
      if (!state?.enabled) {
        continue;
      }

      await this.startLoopTrack(track, state, customSounds, globalTempo, false);
    }

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
  ): Promise<void> {
    await this.startOneShotTrack(track, trackState, customSounds, globalTempo);
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
    await this.startLoopTrack(track, trackState, customSounds, globalTempo, true);
  }

  updateTrackVolume(trackId: string, volume: number): void {
    this.updateTrackHandles(trackId, (handle) => {
      handle.gainNode.gain.setTargetAtTime(volume, this.context?.currentTime ?? 0, 0.015);
    });
  }

  updateTrackRate(trackId: string, rate: number): void {
    this.updateTrackHandles(trackId, (handle) => {
      handle.source.playbackRate.setTargetAtTime(rate, this.context?.currentTime ?? 0, 0.02);
    });
  }

  setTransportClock(startTime: number): void {
    this.transportStartTime = startTime;
  }

  async prepareContext(): Promise<void> {
    await this.ensureContext();
  }
}