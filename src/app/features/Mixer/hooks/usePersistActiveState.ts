/**
 * Debounced persistence of active mixer state (globalTempo + trackStates).
 * Writes to the app state store after a quiet period to avoid flooding
 * the IPC channel during rapid slider interactions.
 */

import { useEffect, useRef } from 'react';

import { setState } from '../../../core/storage/appState';
import type { PersistedActiveState } from '../../../core/storage/appState';
import type { MixerSnapshot } from '../../../core/types/mixData';
import { ACTIVE_STATE_KEY, PERSIST_DEBOUNCE_MS } from '../constants/trackDefaults';

export const usePersistActiveState = (snapshot: MixerSnapshot): void => {
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (persistTimerRef.current !== null) {
      clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = setTimeout(() => {
      const toStore: PersistedActiveState = {
        globalTempo: snapshot.globalTempo,
        trackStates: Object.fromEntries(
          Object.entries(snapshot.trackStates).map(([id, state]) => {
            const { isPlaying: _p, isPreviewPlaying: _pp, ...rest } = state;

            return [id, rest];
          }),
        ),
      };
      setState(ACTIVE_STATE_KEY, toStore);
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      if (persistTimerRef.current !== null) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [snapshot]);
};
