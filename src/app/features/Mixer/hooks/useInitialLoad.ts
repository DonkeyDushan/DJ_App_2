/**
 * Loads all persisted state on mount: custom sounds, preloaded tracks,
 * saved mixes, track presets, favorite IDs, and active state (tempo + track states).
 * Dispatches a single coordinated state update after all data resolves.
 */

import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { DEFAULT_TRACKS } from '../../../core/data/defaultTracks';
import {
  loadCustomSounds,
} from '../../../core/storage/customSounds';
import { loadSavedMixes } from '../../../core/storage/mixStorage';
import {
  type PersistedTrackPreset,
  loadFavoriteIds,
  loadTrackPresets,
} from '../../../core/storage/trackPresets';
import { type PersistedActiveState, getState } from '../../../core/storage/appState';
import type { MixerSnapshot } from '../../../core/types/mixData';
import type { TrackDefinition, TrackState } from '../../../core/types/trackData';
import { ACTIVE_STATE_KEY } from '../constants/trackDefaults';
import {
  createCustomTracks,
  createDefaultSingleTrackState,
  loadPreloadedTracks,
  presetToTrackDefinition,
  withMissingTrackStates,
} from '../utils/trackBuilders';

type InitialLoadParams = {
  setSnapshot: Dispatch<SetStateAction<MixerSnapshot>>;
  setTracks: Dispatch<SetStateAction<TrackDefinition[]>>;
  setPresets: Dispatch<SetStateAction<PersistedTrackPreset[]>>;
  setFavoriteIds: Dispatch<SetStateAction<Set<string>>>;
};

export const useInitialLoad = ({
  setSnapshot,
  setTracks,
  setPresets,
  setFavoriteIds,
}: InitialLoadParams): void => {
  useEffect(() => {
    void (async () => {
      const [
        sounds,
        preloadedTracks,
        loadedMixes,
        loadedPresets,
        loadedFavoriteIds,
        activeState,
      ] = await Promise.all([
        loadCustomSounds(),
        loadPreloadedTracks(),
        loadSavedMixes(),
        loadTrackPresets(),
        loadFavoriteIds(),
        getState<PersistedActiveState>(ACTIVE_STATE_KEY),
      ]);

      const baseTracks = preloadedTracks.length > 0 ? preloadedTracks : DEFAULT_TRACKS;
      const loadedFavoriteSet = new Set(loadedFavoriteIds);
      const presetTracks = loadedPresets.map((p) =>
        presetToTrackDefinition(p, loadedFavoriteSet),
      );
      const nextTracks = [
        ...baseTracks.map((t) => ({ ...t, isFavorite: loadedFavoriteSet.has(t.id) })),
        ...presetTracks,
        ...createCustomTracks(sounds),
      ];

      const restoredTrackStates: Record<string, TrackState> = Object.fromEntries(
        Object.entries(activeState?.trackStates ?? {}).map(([id, state]) => [
          id,
          { ...state, isPlaying: false, isPreviewPlaying: false },
        ]),
      );

      setPresets(loadedPresets);
      setFavoriteIds(loadedFavoriteSet);
      setSnapshot((current) => ({
        ...current,
        globalTempo: activeState?.globalTempo ?? current.globalTempo,
        trackStates: {
          ...withMissingTrackStates(restoredTrackStates, nextTracks),
          ...Object.fromEntries(
            presetTracks
              .filter((t) => !(t.id in restoredTrackStates))
              .map((t) => [t.id, createDefaultSingleTrackState(t.savedSettings)]),
          ),
        },
        customSounds: sounds,
        savedMixes: loadedMixes,
      }));
      setTracks(nextTracks);
    })();
  }, [setSnapshot, setTracks, setPresets, setFavoriteIds]);
};
