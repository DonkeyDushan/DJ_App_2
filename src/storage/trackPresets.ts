import type { TrackCategory, TrackSavedSettings } from '../types';

const PRESETS_KEY = 'dj-app-2-track-presets';
const FAVORITES_KEY = 'dj-app-2-track-favorites';

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

export function loadTrackPresets(): PersistedTrackPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PersistedTrackPreset[];
  } catch {
    return [];
  }
}

export function persistTrackPresets(presets: PersistedTrackPreset[]): void {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

export function loadFavoriteIds(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function persistFavoriteIds(ids: Set<string>): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]));
}

// ---------------------------------------------------------------------------
// Track setting overrides (for base/preloaded tracks)
// Persists user-saved settings independently of the mix snapshot so that
// clearAll still restores user-tuned defaults.
// ---------------------------------------------------------------------------

const OVERRIDES_KEY = 'dj-app-2-track-overrides';

export type TrackOverrides = Record<string, TrackSavedSettings>;

export function loadTrackOverrides(): TrackOverrides {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as TrackOverrides;
  } catch {
    return {};
  }
}

export function persistTrackOverrides(overrides: TrackOverrides): void {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}
