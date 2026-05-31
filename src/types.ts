export type TrackKind = 'demo' | 'custom';

export interface TrackDefinition {
  id: string;
  name: string;
  kind: TrackKind;
  color: string;
  loopLengthSeconds: number;
  preloadedSrc?: string;
  customSoundId?: string;
}

export interface PreloadedAudioFile {
  fileName: string;
  src: string;
}

export interface TrackState {
  enabled: boolean;
  volume: number;
  speed: number;
  followsGlobalTempo: boolean;
  isPlaying: boolean;
}

export interface CustomSoundRecord {
  id: string;
  name: string;
  mimeType: string;
  blob: Blob;
  createdAt: number;
}

export interface SavedMixTrackState {
  enabled: boolean;
  volume: number;
  speed: number;
  followsGlobalTempo: boolean;
}

export interface SavedMix {
  id: string;
  name: string;
  createdAt: number;
  globalTempo: number;
  trackStates: Record<string, SavedMixTrackState>;
}

export interface MixerSnapshot {
  globalTempo: number;
  trackStates: Record<string, TrackState>;
  customSounds: CustomSoundRecord[];
  savedMixes: SavedMix[];
  transportPlaying: boolean;
}
