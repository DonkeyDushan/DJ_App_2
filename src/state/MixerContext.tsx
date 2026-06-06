import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AudioEngine } from '../audio/audioEngine';
import { DEFAULT_TRACKS } from '../data/defaultTracks';
import {
  addCustomSound,
  loadCustomSounds,
  removeCustomSound,
} from '../storage/customSounds';
import { loadSavedMixes, persistSavedMixes } from '../storage/mixStorage';
import {
  type PersistedTrackPreset,
  loadFavoriteIds,
  loadTrackOverrides,
  loadTrackPresets,
  persistFavoriteIds,
  persistTrackOverrides,
  persistTrackPresets,
} from '../storage/trackPresets';
import { type PersistedActiveState, getState, setState } from '../storage/appState';
import type {
  MixerSnapshot,
  SavedMix,
  TrackCategory,
  TrackDefinition,
  TrackSavedSettings,
  TrackState,
} from '../types';
import {
  DEFAULT_SINGLE_TRACK_VALUES,
  createCustomTracks,
  createDefaultSingleTrackState,
  createInitialSnapshot,
  loadPreloadedTracks,
  mergeTrackState,
  normalizeMixTrackState,
  presetToTrackDefinition,
  withMissingTrackStates,
} from './mixerHelpers';

const ACTIVE_STATE_KEY = 'active-state';

type MixerContextValue = {
  snapshot: MixerSnapshot;
  tracks: TrackDefinition[];
  engine: AudioEngine;
  actions: {
    toggleTrack: (trackId: string, enabled: boolean) => Promise<void>;
    playTrackOnce: (trackId: string) => Promise<void>;
    setTrackVolume: (trackId: string, volume: number) => void;
    setTrackSpeed: (trackId: string, speed: number) => void;
    setTrackEq: (
      trackId: string,
      eqLow: number,
      eqMid: number,
      eqHigh: number,
    ) => void;
    setTrackEffects: (
      trackId: string,
      reverbSend: number,
      delaySend: number,
    ) => void;
    setGlobalTempo: (tempo: number) => void;
    toggleTransport: () => Promise<void>;
    restartTransport: () => Promise<void>;
    loadInitialData: () => Promise<void>;
    addCustomSound: (file: File) => Promise<void>;
    deleteCustomSound: (soundId: string) => Promise<void>;
    saveMix: (name: string) => void;
    loadMix: (mixId: string) => Promise<void>;
    deleteMix: (mixId: string) => void;
    saveTrackPreset: (
      sourceTrackId: string,
      name: string,
      category: TrackCategory,
      settings: TrackSavedSettings,
      existingPresetId?: string,
    ) => string;
    restoreTrackSettings: (
      trackId: string,
      settings: TrackSavedSettings,
    ) => void;
    deleteTrackPreset: (presetId: string) => void;
    toggleFavorite: (trackId: string) => void;
    saveTrackOverride: (trackId: string, settings: TrackSavedSettings) => void;
  };
};

const MixerContext = createContext<MixerContextValue | null>(null);

export const MixerProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const [snapshot, setSnapshot] = useState<MixerSnapshot>(createInitialSnapshot);
  const [tracks, setTracks] = useState<TrackDefinition[]>(DEFAULT_TRACKS);
  const [, setPresets] = useState<PersistedTrackPreset[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const engine = useMemo(() => new AudioEngine(), []);

  // Load all persisted state on mount.
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
  }, []);

  // Persist active state (globalTempo + trackStates) with a debounce so rapid
  // changes like slider dragging don't flood the IPC channel with writes.
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
    }, 500);

    return () => {
      if (persistTimerRef.current !== null) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [snapshot]);

  useEffect(() => {
    const unsubscribe = engine.subscribeToPlayback((trackId, playbackState) => {
      setSnapshot((current) => {
        const currentTrackState = current.trackStates[trackId];
        if (!currentTrackState) {
          return current;
        }

        if (
          currentTrackState.isPlaying === playbackState.isPlaying &&
          currentTrackState.isPreviewPlaying === playbackState.isPreviewPlaying
        ) {
          return current;
        }

        return {
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, {
            isPlaying: playbackState.isPlaying,
            isPreviewPlaying: playbackState.isPreviewPlaying,
          }),
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [engine]);

  const actions: MixerContextValue['actions'] = useMemo(
    () => ({
      toggleTrack: async (trackId: string, enabled: boolean) => {
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, {
            enabled,
          }),
        }));

        const track = tracks.find((entry) => entry.id === trackId);
        const state = snapshot.trackStates[trackId];
        if (!track || !state) {
          return;
        }

        const nextState = { ...state, enabled };
        if (enabled) {
          await engine.syncTrack(
            track,
            nextState,
            snapshot.customSounds,
            snapshot.globalTempo,
          );
          return;
        }

        await engine.syncTrack(
          track,
          nextState,
          snapshot.customSounds,
          snapshot.globalTempo,
        );
      },
      playTrackOnce: async (trackId: string) => {
        if (snapshot.transportPlaying) {
          return;
        }

        const track = tracks.find((entry) => entry.id === trackId);
        const state = snapshot.trackStates[trackId];
        if (!track || !state) {
          return;
        }

        await engine.playTrackOnce(
          track,
          state,
          snapshot.customSounds,
          snapshot.globalTempo,
        );
      },
      setTrackVolume: (trackId: string, volume: number) => {
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, {
            volume,
          }),
        }));
        engine.updateTrackVolume(trackId, volume);
      },
      setTrackSpeed: (trackId: string, speed: number) => {
        const followsGlobalTempo =
          Math.abs(speed - snapshot.globalTempo) < 0.001;
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, {
            speed,
            followsGlobalTempo,
          }),
        }));

        engine.updateTrackRate(
          trackId,
          followsGlobalTempo ? snapshot.globalTempo : speed,
        );
      },
      setTrackEq: (
        trackId: string,
        eqLow: number,
        eqMid: number,
        eqHigh: number,
      ) => {
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, {
            eqLow,
            eqMid,
            eqHigh,
          }),
        }));

        engine.updateTrackEq(trackId, eqLow, eqMid, eqHigh);
      },
      setTrackEffects: (
        trackId: string,
        reverbSend: number,
        delaySend: number,
      ) => {
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, {
            reverbSend,
            delaySend,
          }),
        }));

        engine.updateTrackEffects(trackId, reverbSend, delaySend);
      },
      setGlobalTempo: (tempo: number) => {
        setSnapshot((current) => ({
          ...current,
          globalTempo: tempo,
          trackStates: Object.fromEntries(
            Object.entries(current.trackStates).map(([trackId, trackState]) => [
              trackId,
              {
                ...trackState,
                followsGlobalTempo:
                  trackState.followsGlobalTempo ||
                  Math.abs(trackState.speed - tempo) < 0.001,
              },
            ]),
          ),
        }));

        Object.entries(snapshot.trackStates).forEach(
          ([trackId, trackState]) => {
            engine.updateTrackRate(
              trackId,
              trackState.followsGlobalTempo ? tempo : trackState.speed,
            );
          },
        );
      },
      toggleTransport: async () => {
        if (snapshot.transportPlaying) {
          await engine.stopTransport(true);
          setSnapshot((current) => ({
            ...current,
            transportPlaying: false,
            trackStates: Object.fromEntries(
              Object.entries(current.trackStates).map(
                ([trackId, trackState]) => [
                  trackId,
                  {
                    ...trackState,
                    isPlaying: false,
                    isPreviewPlaying: false,
                  },
                ],
              ),
            ),
          }));
          return;
        }

        await engine.startTransport(
          tracks,
          snapshot.trackStates,
          snapshot.customSounds,
          snapshot.globalTempo,
        );
        setSnapshot((current) => ({
          ...current,
          transportPlaying: true,
          trackStates: Object.fromEntries(
            Object.entries(current.trackStates).map(([trackId, trackState]) => [
              trackId,
              {
                ...trackState,
                isPlaying: trackState.enabled,
                isPreviewPlaying: false,
              },
            ]),
          ),
        }));
      },
      restartTransport: async () => {
        await engine.restartTransport(
          tracks,
          snapshot.trackStates,
          snapshot.customSounds,
          snapshot.globalTempo,
        );
        setSnapshot((current) => ({
          ...current,
          transportPlaying: true,
          trackStates: Object.fromEntries(
            Object.entries(current.trackStates).map(([trackId, trackState]) => [
              trackId,
              {
                ...trackState,
                isPlaying: trackState.enabled,
                isPreviewPlaying: false,
              },
            ]),
          ),
        }));
      },
      loadInitialData: async () => {
        const [
          sounds,
          preloadedTracks,
          loadedMixes,
          loadedPresets,
          loadedFavoriteIds,
        ] = await Promise.all([
          loadCustomSounds(),
          loadPreloadedTracks(),
          loadSavedMixes(),
          loadTrackPresets(),
          loadFavoriteIds(),
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

        setSnapshot((current) => ({
          ...current,
          customSounds: sounds,
          savedMixes: loadedMixes,
          trackStates: withMissingTrackStates(current.trackStates, nextTracks),
        }));
        setTracks(nextTracks);
        setPresets(loadedPresets);
        setFavoriteIds(loadedFavoriteSet);
      },
      addCustomSound: async (file: File) => {
        const record = await addCustomSound(file);
        setSnapshot((current) => ({
          ...current,
          customSounds: [...current.customSounds, record],
          trackStates: {
            ...current.trackStates,
            [record.id]:
              current.trackStates[record.id] ?? createDefaultSingleTrackState(),
          },
        }));
        setTracks((current) => {
          const baseTracks = current.filter((track) => track.kind !== 'custom');
          return [
            ...baseTracks,
            ...createCustomTracks([...snapshot.customSounds, record]),
          ];
        });
      },
      deleteCustomSound: async (soundId: string) => {
        await removeCustomSound(soundId);
        setSnapshot((current) => {
          const nextSounds = current.customSounds.filter(
            (sound) => sound.id !== soundId,
          );
          const nextTrackStates = { ...current.trackStates };
          delete nextTrackStates[soundId];
          return {
            ...current,
            customSounds: nextSounds,
            trackStates: nextTrackStates,
          };
        });

        setTracks((current) =>
          current.filter(
            (track) => track.customSoundId !== soundId || track.kind === 'demo',
          ),
        );
        engine.syncTrack(
          {
            id: soundId,
            name: soundId.toUpperCase(),
            kind: 'custom',
            category: 'custom' as const,
            color: '#ff4fd8',
            loopLengthSeconds: 8,
            customSoundId: soundId,
          },
          { ...DEFAULT_SINGLE_TRACK_VALUES, volume: 0 },
          snapshot.customSounds,
          snapshot.globalTempo,
        );
      },
      saveMix: (name: string) => {
        const mix: SavedMix = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name,
          createdAt: Date.now(),
          globalTempo: snapshot.globalTempo,
          trackStates: Object.fromEntries(
            Object.entries(snapshot.trackStates).map(
              ([trackId, trackState]) => [
                trackId,
                normalizeMixTrackState(trackState),
              ],
            ),
          ),
        };

        const nextMixes = [mix, ...snapshot.savedMixes].slice(0, 12);
        persistSavedMixes(nextMixes);
        setSnapshot((current) => ({
          ...current,
          savedMixes: nextMixes,
        }));
      },
      loadMix: async (mixId: string) => {
        const mix = snapshot.savedMixes.find((entry) => entry.id === mixId);
        if (!mix) {
          return;
        }

        const wasPlaying = snapshot.transportPlaying;
        if (wasPlaying) {
          await engine.stopTransport(true);
        }

        const nextTrackStates = { ...snapshot.trackStates };
        Object.entries(mix.trackStates).forEach(([trackId, trackState]) => {
          nextTrackStates[trackId] = {
            ...(nextTrackStates[trackId] ?? DEFAULT_SINGLE_TRACK_VALUES),
            ...trackState,
          };
        });

        setSnapshot((current) => ({
          ...current,
          globalTempo: mix.globalTempo,
          trackStates: nextTrackStates,
          transportPlaying: wasPlaying,
        }));

        if (wasPlaying) {
          await engine.startTransport(
            tracks,
            nextTrackStates,
            snapshot.customSounds,
            mix.globalTempo,
          );
        }
      },
      deleteMix: (mixId: string) => {
        const nextMixes = snapshot.savedMixes.filter(
          (entry) => entry.id !== mixId,
        );
        persistSavedMixes(nextMixes);
        setSnapshot((current) => ({
          ...current,
          savedMixes: nextMixes,
        }));
      },
      saveTrackPreset: (
        sourceTrackId: string,
        name: string,
        category: TrackCategory,
        settings: TrackSavedSettings,
        existingPresetId?: string,
      ): string => {
        const sourceTrack = tracks.find((t) => t.id === sourceTrackId);
        if (!sourceTrack) return existingPresetId ?? '';
        const generatedId = existingPresetId ?? `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setPresets((current) => {
          let next: PersistedTrackPreset[];
          if (existingPresetId) {
            next = current.map((p) =>
              p.id === existingPresetId
                ? { ...p, name, category, savedSettings: settings }
                : p,
            );
          } else {
            const newPreset: PersistedTrackPreset = {
              id: generatedId,
              name,
              category,
              color: sourceTrack.color,
              loopLengthSeconds: sourceTrack.loopLengthSeconds,
              savedSettings: settings,
              sourceTrackId,
              preloadedSrc: sourceTrack.preloadedSrc,
              customSoundId: sourceTrack.customSoundId,
            };
            next = [...current, newPreset];
          }
          persistTrackPresets(next);
          const presetTracks = next.map((p) =>
            presetToTrackDefinition(p, favoriteIds),
          );
          setTracks((currentTracks) => {
            const baseTracks = currentTracks.filter(
              (t) => !t.sourceTrackId,
            );
            return [...baseTracks, ...presetTracks];
          });
          setSnapshot((s) => ({
            ...s,
            trackStates: {
              ...s.trackStates,
              ...Object.fromEntries(
                presetTracks
                  .filter((t) => !(t.id in s.trackStates))
                  .map((t) => [
                    t.id,
                    createDefaultSingleTrackState(t.savedSettings),
                  ]),
              ),
            },
          }));
          return next;
        });
        return generatedId;
      },
      restoreTrackSettings: (trackId: string, settings: TrackSavedSettings) => {
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, {
            volume: settings.volume,
            speed: settings.speed,
            followsGlobalTempo: settings.followsGlobalTempo,
            eqLow: settings.eqLow,
            eqMid: settings.eqMid,
            eqHigh: settings.eqHigh,
            reverbSend: settings.reverbSend,
            delaySend: settings.delaySend,
          }),
        }));
        engine.updateTrackVolume(trackId, settings.volume);
        engine.updateTrackRate(
          trackId,
          settings.followsGlobalTempo
            ? snapshot.globalTempo
            : settings.speed,
        );
        engine.updateTrackEq(
          trackId,
          settings.eqLow,
          settings.eqMid,
          settings.eqHigh,
        );
        engine.updateTrackEffects(
          trackId,
          settings.reverbSend,
          settings.delaySend,
        );
      },
      deleteTrackPreset: (presetId: string) => {
        setPresets((current) => {
          const next = current.filter((p) => p.id !== presetId);
          persistTrackPresets(next);
          setTracks((currentTracks) =>
            currentTracks.filter((t) => t.id !== presetId),
          );
          setSnapshot((s) => {
            const nextStates = { ...s.trackStates };
            delete nextStates[presetId];
            return { ...s, trackStates: nextStates };
          });
          return next;
        });
      },
      toggleFavorite: (trackId: string) => {
        setFavoriteIds((current) => {
          const next = new Set(current);
          if (next.has(trackId)) {
            next.delete(trackId);
          } else {
            next.add(trackId);
          }
          persistFavoriteIds(next);
          setTracks((currentTracks) =>
            currentTracks.map((t) =>
              t.id === trackId ? { ...t, isFavorite: next.has(trackId) } : t,
            ),
          );
          return next;
        });
      },
      saveTrackOverride: (trackId: string, settings: TrackSavedSettings) => {
        loadTrackOverrides().then((current) => {
          persistTrackOverrides({ ...current, [trackId]: settings });
        });
      },
    }),
    [engine, favoriteIds, snapshot, tracks],
  );

  const value = useMemo<MixerContextValue>(
    () => ({
      snapshot,
      tracks,
      engine,
      actions,
    }),
    [actions, engine, snapshot, tracks],
  );

  return (
    <MixerContext.Provider value={value}>{children}</MixerContext.Provider>
  );
}

export const useMixer = (): MixerContextValue => {
  const context = useContext(MixerContext);
  if (!context) {
    throw new Error('useMixer must be used inside MixerProvider');
  }

  return context;
}
