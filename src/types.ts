export type TrackKind = 'demo' | 'custom';
export type TrackCategory = 'drums' | 'arp' | 'pad' | 'custom' | 'other';

export interface TrackSavedSettings {
  volume: number;
  speed: number;
  followsGlobalTempo: boolean;
  eqLow: number;
  eqMid: number;
  eqHigh: number;
  reverbSend: number;
  delaySend: number;
}

export interface TrackDefinition {
  id: string;
  name: string;
  kind: TrackKind;
  category: TrackCategory;
  color: string;
  loopLengthSeconds: number;
  isFavorite?: boolean;
  savedSettings?: TrackSavedSettings;
  sourceTrackId?: string;
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
  eqLow: number;
  eqMid: number;
  eqHigh: number;
  reverbSend: number;
  delaySend: number;
  isPlaying: boolean;
  isPreviewPlaying: boolean;
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
  eqLow: number;
  eqMid: number;
  eqHigh: number;
  reverbSend: number;
  delaySend: number;
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
