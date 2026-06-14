/**
 * Composes all mixer action groups into a single MixerActions object.
 * Each group is built by a focused builder function (not hooks — plain functions
 * that return action maps, so the dep array stays stable and minimal).
 */

import { useMemo } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { AudioEngine } from '../../../core/audio/audioEngine';
import type { PersistedTrackPreset } from '../../../core/storage/trackPresets';
import type { MixerSnapshot } from '../../../core/types/mixData';
import type { TrackDefinition } from '../../../core/types/trackData';
import type { MixerActions } from '../types/mixerContext';
import { buildTransportActions } from './useTransportActions';
import { buildMixManagementActions } from './useMixManagement';
import { buildPresetManagementActions } from './usePresetManagement';

type UseMixerActionsParams = {
  engine: AudioEngine;
  snapshotRef: MutableRefObject<MixerSnapshot>;
  tracksRef: MutableRefObject<TrackDefinition[]>;
  favoriteIdsRef: MutableRefObject<Set<string>>;
  activeMixIdRef: MutableRefObject<string | null>;
  setSnapshot: Dispatch<SetStateAction<MixerSnapshot>>;
  setTracks: Dispatch<SetStateAction<TrackDefinition[]>>;
  setPresets: Dispatch<SetStateAction<PersistedTrackPreset[]>>;
  setFavoriteIds: Dispatch<SetStateAction<Set<string>>>;
  setActiveMixId: Dispatch<SetStateAction<string | null>>;
};

export const useMixerActions = ({
  engine,
  snapshotRef,
  tracksRef,
  favoriteIdsRef,
  activeMixIdRef,
  setSnapshot,
  setTracks,
  setPresets,
  setFavoriteIds,
  setActiveMixId,
}: UseMixerActionsParams): MixerActions =>
  useMemo(
    () => ({
      ...buildTransportActions({ engine, snapshotRef, tracksRef, setSnapshot }),
      ...buildMixManagementActions({
        engine,
        snapshotRef,
        tracksRef,
        activeMixIdRef,
        setSnapshot,
        setTracks,
        setActiveMixId,
      }),
      ...buildPresetManagementActions({
        engine,
        snapshotRef,
        tracksRef,
        favoriteIdsRef,
        setSnapshot,
        setTracks,
        setPresets,
        setFavoriteIds,
      }),
    }),
    [
      engine,
      snapshotRef,
      tracksRef,
      favoriteIdsRef,
      activeMixIdRef,
      setSnapshot,
      setTracks,
      setPresets,
      setFavoriteIds,
      setActiveMixId,
    ],
  );
