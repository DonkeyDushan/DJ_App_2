/**
 * Generic key-value persistence layer backed by the Electron IPC store.
 * Wraps `window.djApp.store` for typed read/write access.
 */

import type { TrackState } from '../types/trackData';
import { markSessionDirty } from '../session/sessionDirtyStore';

export type PersistedActiveState = {
  globalTempo: number;
  trackStates: Record<string, Omit<TrackState, 'isPlaying' | 'isPreviewPlaying'>>;
};

const store = () => window.djApp!.store!;

export const getState = async <T>(key: string): Promise<T | null> => {
  const value = await store().get(key);

  return value as T | null;
};

export const setState = (key: string, value: unknown): void => {
  markSessionDirty();
  void store()
    .set(key, value)
    .catch((err: unknown) => {
      console.error(`[storage] Failed to write "${key}":`, err);
    });
};
