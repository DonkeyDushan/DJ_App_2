/**
 * Core data types for track definitions and audio configuration.
 * Used by Mixer, TrackEditing, and audio engine.
 */

export type TrackKind = 'demo' | 'custom';

export type TrackCategory =
  | 'drums'
  | 'arp'
  | 'bass'
  | 'keys'
  | 'pad'
  | 'custom'
  | 'other';

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
