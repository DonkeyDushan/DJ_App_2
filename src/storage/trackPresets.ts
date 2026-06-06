import type { TrackCategory, TrackSavedSettings } from '../types';
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

const PRESETS_KEY = 'track-presets';
const FAVORITES_KEY = 'track-favorites';
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
