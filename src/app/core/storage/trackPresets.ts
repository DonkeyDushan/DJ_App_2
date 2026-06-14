/**
 * Persistence layer for track presets, favorites, and per-track overrides.
 */

import type { TrackCategory, TrackSavedSettings } from '../types/trackData';
import { getState, setState } from './appState';

export interface PersistedTrackPreset {
  id: string;
  name: string;
  category: TrackCategory;
  color: string;
  loopLengthSeconds: number;
  savedSettings: TrackSavedSettings;
  sourceTrackId: string;
  preloadedSrc?: string;
  customSoundId?: string;
}

export type TrackOverrides = Record<string, TrackSavedSettings>;

/** Storage key for the track presets list. */
const PRESETS_KEY = 'track-presets';

/** Storage key for the set of favorited track IDs. */
const FAVORITES_KEY = 'track-favorites';

/** Storage key for per-track saved setting overrides. */
const OVERRIDES_KEY = 'track-overrides';

export const loadTrackPresets = async (): Promise<PersistedTrackPreset[]> =>
  (await getState<PersistedTrackPreset[]>(PRESETS_KEY)) ?? [];

export const persistTrackPresets = (presets: PersistedTrackPreset[]): void => {
  setState(PRESETS_KEY, presets);
};

export const loadFavoriteIds = async (): Promise<string[]> =>
  (await getState<string[]>(FAVORITES_KEY)) ?? [];

export const persistFavoriteIds = (ids: Set<string>): void => {
  setState(FAVORITES_KEY, [...ids]);
};

export const loadTrackOverrides = async (): Promise<TrackOverrides> =>
  (await getState<TrackOverrides>(OVERRIDES_KEY)) ?? {};

export const persistTrackOverrides = (overrides: TrackOverrides): void => {
  setState(OVERRIDES_KEY, overrides);
};
