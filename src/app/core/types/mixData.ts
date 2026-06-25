/**
 * Core data types for saved mixes and mixer snapshots.
 * Used by Mixer and Set features.
 */

import type { MixColorKey } from '../constants/mixColors';
import type { TrackState } from './trackData';

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
  color?: MixColorKey;
}

/**
 * Editable fields of a saved mix. A `null` color clears the accent;
 * an omitted field leaves the current value untouched.
 */
export interface MixUpdate {
  name?: string;
  color?: MixColorKey | null;
}

export interface MixerSnapshot {
  globalTempo: number;
  trackStates: Record<string, TrackState>;
  customSounds: CustomSoundRecord[];
  savedMixes: SavedMix[];
  transportPlaying: boolean;
}
