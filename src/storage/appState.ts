import type { TrackState } from '../types';

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
  void store()
    .set(key, value)
    .catch((err: unknown) => {
      console.error(`[storage] Failed to write "${key}":`, err);
    });
};
