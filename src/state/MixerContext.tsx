import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { AudioEngine } from '../audio/audioEngine';
import {
  DEFAULT_GLOBAL_TEMPO,
  DEFAULT_TRACKS,
  createCustomTrackDefinition,
  createDefaultTrackState,
  createPreloadedTrackDefinitions,
} from '../data/defaultTracks';
import { addCustomSound, loadCustomSounds, removeCustomSound } from '../storage/customSounds';
import { loadSavedMixes, persistSavedMixes } from '../storage/mixStorage';
import type { CustomSoundRecord, MixerSnapshot, SavedMix, SavedMixTrackState, TrackDefinition, TrackState } from '../types';

const MIXES_KEY = 'dj-app-2-active-mix';

type MixerContextValue = {
  snapshot: MixerSnapshot;
  tracks: TrackDefinition[];
  engine: AudioEngine;
  actions: {
    toggleTrack: (trackId: string, enabled: boolean) => Promise<void>;
    playTrackOnce: (trackId: string) => Promise<void>;
    setTrackVolume: (trackId: string, volume: number) => void;
    setTrackSpeed: (trackId: string, speed: number) => void;
    setGlobalTempo: (tempo: number) => void;
    toggleTransport: () => Promise<void>;
    restartTransport: () => Promise<void>;
    clearAll: () => Promise<void>;
    loadInitialData: () => Promise<void>;
    addCustomSound: (file: File) => Promise<void>;
    deleteCustomSound: (soundId: string) => Promise<void>;
    saveMix: (name: string) => void;
    loadMix: (mixId: string) => Promise<void>;
    deleteMix: (mixId: string) => void;
  };
};

const MixerContext = createContext<MixerContextValue | null>(null);

function createCustomTracks(customSounds: CustomSoundRecord[]): TrackDefinition[] {
  const palette = ['#ff4fd8', '#40d9ff', '#9f6bff', '#ff8f4f', '#6cff9f', '#ffd84f'];

  return customSounds.map((sound, index) =>
    createCustomTrackDefinition(sound.id, sound.name.toUpperCase(), palette[index % palette.length], 8 + index % 4),
  );
}

function createDefaultSingleTrackState(): TrackState {
  return {
    enabled: false,
    volume: 0.78,
    speed: 1,
    followsGlobalTempo: true,
    isPlaying: false,
  };
}

function createTrackStateForTracks(trackDefinitions: TrackDefinition[]): Record<string, TrackState> {
  return Object.fromEntries(trackDefinitions.map((track) => [track.id, createDefaultSingleTrackState()]));
}

async function loadPreloadedTracks(): Promise<TrackDefinition[]> {
  try {
    const files = await window.djApp?.listPreloadedAudio?.();
    if (!files || files.length === 0) {
      return [];
    }

    return createPreloadedTrackDefinitions(files);
  } catch {
    return [];
  }
}

function withMissingTrackStates(currentStates: Record<string, TrackState>, trackDefinitions: TrackDefinition[]): Record<string, TrackState> {
  return trackDefinitions.reduce(
    (states, track) => ({
      ...states,
      [track.id]: states[track.id] ?? createDefaultSingleTrackState(),
    }),
    currentStates,
  );
}

function createInitialSnapshot(): MixerSnapshot {
  return {
    globalTempo: DEFAULT_GLOBAL_TEMPO,
    trackStates: createDefaultTrackState(),
    customSounds: [],
    savedMixes: loadSavedMixes(),
    transportPlaying: false,
  };
}

function mergeTrackState(trackStates: Record<string, TrackState>, trackId: string, patch: Partial<TrackState>): Record<string, TrackState> {
  const current = trackStates[trackId] ?? {
    enabled: false,
    volume: 0.78,
    speed: 1,
    followsGlobalTempo: true,
    isPlaying: false,
  };

  return {
    ...trackStates,
    [trackId]: {
      ...current,
      ...patch,
    },
  };
}

function normalizeMixTrackState(trackState: TrackState): SavedMixTrackState {
  return {
    enabled: trackState.enabled,
    volume: trackState.volume,
    speed: trackState.speed,
    followsGlobalTempo: trackState.followsGlobalTempo,
  };
}

export function MixerProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [snapshot, setSnapshot] = useState<MixerSnapshot>(createInitialSnapshot);
  const [tracks, setTracks] = useState<TrackDefinition[]>(DEFAULT_TRACKS);
  const engine = useMemo(() => new AudioEngine(), []);

  useEffect(() => {
    const persisted = window.localStorage.getItem(MIXES_KEY);
    if (!persisted) {
      return;
    }

    try {
      const parsed = JSON.parse(persisted) as MixerSnapshot;
      setSnapshot((current) => ({
        ...current,
        globalTempo: parsed.globalTempo ?? current.globalTempo,
        trackStates: { ...current.trackStates, ...parsed.trackStates },
        transportPlaying: false,
      }));
    } catch {
      // Ignore malformed state.
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const sounds = await loadCustomSounds();
      const preloadedTracks = await loadPreloadedTracks();
      const baseTracks = preloadedTracks.length > 0 ? preloadedTracks : DEFAULT_TRACKS;
      const nextTracks = [...baseTracks, ...createCustomTracks(sounds)];

      setSnapshot((current) => ({
        ...current,
        customSounds: sounds,
        savedMixes: loadSavedMixes(),
        trackStates: withMissingTrackStates(current.trackStates, nextTracks),
      }));
      setTracks(nextTracks);
    })();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(MIXES_KEY, JSON.stringify(snapshot));
  }, [snapshot]);

  const actions: MixerContextValue['actions'] = useMemo(
    () => ({
      toggleTrack: async (trackId: string, enabled: boolean) => {
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, { enabled }),
        }));

        const track = tracks.find((entry) => entry.id === trackId);
        const state = snapshot.trackStates[trackId];
        if (!track || !state) {
          return;
        }

        const nextState = { ...state, enabled };
        if (enabled) {
          await engine.syncTrack(track, nextState, snapshot.customSounds, snapshot.globalTempo);
          return;
        }

        await engine.syncTrack(track, nextState, snapshot.customSounds, snapshot.globalTempo);
      },
      playTrackOnce: async (trackId: string) => {
        const track = tracks.find((entry) => entry.id === trackId);
        const state = snapshot.trackStates[trackId];
        if (!track || !state) {
          return;
        }

        await engine.playTrackOnce(track, state, snapshot.customSounds, snapshot.globalTempo);
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, { isPlaying: true }),
        }));
      },
      setTrackVolume: (trackId: string, volume: number) => {
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, { volume }),
        }));
        engine.updateTrackVolume(trackId, volume);
      },
      setTrackSpeed: (trackId: string, speed: number) => {
        const followsGlobalTempo = Math.abs(speed - snapshot.globalTempo) < 0.001;
        setSnapshot((current) => ({
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, { speed, followsGlobalTempo }),
        }));

        engine.updateTrackRate(trackId, followsGlobalTempo ? snapshot.globalTempo : speed);
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
                followsGlobalTempo: trackState.followsGlobalTempo || Math.abs(trackState.speed - tempo) < 0.001,
              },
            ]),
          ),
        }));

        Object.entries(snapshot.trackStates).forEach(([trackId, trackState]) => {
          engine.updateTrackRate(trackId, trackState.followsGlobalTempo ? tempo : trackState.speed);
        });
      },
      toggleTransport: async () => {
        if (snapshot.transportPlaying) {
          await engine.stopTransport(true);
          setSnapshot((current) => ({
            ...current,
            transportPlaying: false,
            trackStates: Object.fromEntries(
              Object.entries(current.trackStates).map(([trackId, trackState]) => [trackId, { ...trackState, isPlaying: false }]),
            ),
          }));
          return;
        }

        await engine.startTransport(tracks, snapshot.trackStates, snapshot.customSounds, snapshot.globalTempo);
        setSnapshot((current) => ({
          ...current,
          transportPlaying: true,
          trackStates: Object.fromEntries(
            Object.entries(current.trackStates).map(([trackId, trackState]) => [
              trackId,
              {
                ...trackState,
                isPlaying: trackState.enabled,
              },
            ]),
          ),
        }));
      },
      restartTransport: async () => {
        await engine.restartTransport(tracks, snapshot.trackStates, snapshot.customSounds, snapshot.globalTempo);
        setSnapshot((current) => ({
          ...current,
          transportPlaying: true,
          trackStates: Object.fromEntries(
            Object.entries(current.trackStates).map(([trackId, trackState]) => [trackId, { ...trackState, isPlaying: trackState.enabled }]),
          ),
        }));
      },
      clearAll: async () => {
        await engine.stopTransport(true);
        setSnapshot((current) => ({
          ...current,
          transportPlaying: false,
          globalTempo: DEFAULT_GLOBAL_TEMPO,
          trackStates: withMissingTrackStates(createTrackStateForTracks(tracks), tracks),
        }));
      },
      loadInitialData: async () => {
        const sounds = await loadCustomSounds();
        const preloadedTracks = await loadPreloadedTracks();
        const loadedMixes = loadSavedMixes();
        const baseTracks = preloadedTracks.length > 0 ? preloadedTracks : DEFAULT_TRACKS;
        const nextTracks = [...baseTracks, ...createCustomTracks(sounds)];
        setSnapshot((current) => ({
          ...current,
          customSounds: sounds,
          savedMixes: loadedMixes,
          trackStates: withMissingTrackStates(current.trackStates, nextTracks),
        }));
        setTracks(nextTracks);
      },
      addCustomSound: async (file: File) => {
        const record = await addCustomSound(file);
        setSnapshot((current) => ({
          ...current,
          customSounds: [...current.customSounds, record],
          trackStates: {
            ...current.trackStates,
            [record.id]: current.trackStates[record.id] ?? createDefaultSingleTrackState(),
          },
        }));
        setTracks((current) => {
          const baseTracks = current.filter((track) => track.kind !== 'custom');
          return [...baseTracks, ...createCustomTracks([...snapshot.customSounds, record])];
        });
      },
      deleteCustomSound: async (soundId: string) => {
        await removeCustomSound(soundId);
        setSnapshot((current) => {
          const nextSounds = current.customSounds.filter((sound) => sound.id !== soundId);
          const nextTrackStates = { ...current.trackStates };
          delete nextTrackStates[soundId];
          return {
            ...current,
            customSounds: nextSounds,
            trackStates: nextTrackStates,
          };
        });

        setTracks((current) => current.filter((track) => track.customSoundId !== soundId || track.kind === 'demo'));
        engine.syncTrack(
          {
            id: soundId,
            name: soundId.toUpperCase(),
            kind: 'custom',
            color: '#ff4fd8',
            loopLengthSeconds: 8,
            customSoundId: soundId,
          },
          {
            enabled: false,
            volume: 0,
            speed: 1,
            followsGlobalTempo: true,
            isPlaying: false,
          },
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
            Object.entries(snapshot.trackStates).map(([trackId, trackState]) => [trackId, normalizeMixTrackState(trackState)]),
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
            ...(nextTrackStates[trackId] ?? {
              enabled: false,
              volume: 0.78,
              speed: 1,
              followsGlobalTempo: true,
              isPlaying: false,
            }),
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
          await engine.startTransport(tracks, nextTrackStates, snapshot.customSounds, mix.globalTempo);
        }
      },
      deleteMix: (mixId: string) => {
        const nextMixes = snapshot.savedMixes.filter((entry) => entry.id !== mixId);
        persistSavedMixes(nextMixes);
        setSnapshot((current) => ({
          ...current,
          savedMixes: nextMixes,
        }));
      },
    }),
    [engine, snapshot, tracks],
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

  return <MixerContext.Provider value={value}>{children}</MixerContext.Provider>;
}

export function useMixer(): MixerContextValue {
  const context = useContext(MixerContext);
  if (!context) {
    throw new Error('useMixer must be used inside MixerProvider');
  }

  return context;
}