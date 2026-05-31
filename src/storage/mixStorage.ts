import type { SavedMix } from '../types';

const STORAGE_KEY = 'dj-app-2-saved-mixes';

export function loadSavedMixes(): SavedMix[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as SavedMix[];
  } catch {
    return [];
  }
}

export function persistSavedMixes(mixes: SavedMix[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes));
}