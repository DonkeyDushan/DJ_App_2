import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AudioEngine } from '../../core/audio/audioEngine';
import { DEFAULT_TRACKS } from '../../core/data/defaultTracks';
import type { PersistedTrackPreset } from '../../core/storage/trackPresets';
import type { TrackDefinition } from '../../core/types/trackData';
import type { MixerContextValue } from './types/mixerContext';
import { createInitialSnapshot } from './utils/trackBuilders';
import { useInitialLoad } from './hooks/useInitialLoad';
import { usePersistActiveState } from './hooks/usePersistActiveState';
import { usePlaybackSync } from './hooks/usePlaybackSync';
import { useMixerActions } from './hooks/useMixerActions';

const MixerContext = createContext<MixerContextValue | null>(null);

export const MixerProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const [snapshot, setSnapshot] = useState(createInitialSnapshot);
  const [tracks, setTracks] = useState<TrackDefinition[]>(DEFAULT_TRACKS);
  const [, setPresets] = useState<PersistedTrackPreset[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [activeMixId, setActiveMixId] = useState<string | null>(null);
  const engine = useMemo(() => new AudioEngine(), []);

  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const favoriteIdsRef = useRef(favoriteIds);
  favoriteIdsRef.current = favoriteIds;
  const activeMixIdRef = useRef(activeMixId);
  activeMixIdRef.current = activeMixId;

  useInitialLoad({ setSnapshot, setTracks, setPresets, setFavoriteIds });
  usePersistActiveState(snapshot);
  usePlaybackSync(engine, setSnapshot);

  const actions = useMixerActions({
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
  });

  const value = useMemo<MixerContextValue>(
    () => ({
      snapshot,
      tracks,
      engine,
      activeMixId,
      actions,
    }),
    [actions, activeMixId, engine, snapshot, tracks],
  );

  return (
    <MixerContext.Provider value={value}>{children}</MixerContext.Provider>
  );
};

export const useMixer = (): MixerContextValue => {
  const context = useContext(MixerContext);
  if (!context) {
    throw new Error('useMixer must be used inside MixerProvider');
  }

  return context;
};
