/**
 * Mix management actions: save, load, overwrite, delete, clear, reset mixes,
 * and custom sound management.
 */

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { AudioEngine } from '../../../core/audio/audioEngine';
import {
  addCustomSound,
  loadCustomSounds,
  removeCustomSound,
  renameCustomSound as renameCustomSoundStorage,
  replaceCustomSound as replaceCustomSoundStorage,
} from '../../../core/storage/customSounds';
import { loadSavedMixes, persistSavedMixes } from '../../../core/storage/mixStorage';
import { loadFavoriteIds, loadTrackPresets } from '../../../core/storage/trackPresets';
import type { SavedMix, MixerSnapshot, MixUpdate } from '../../../core/types/mixData';
import type { MixColorKey } from '../../../core/constants/mixColors';
import type { TransitionKind } from '../../../core/types/transition';
import type { TrackDefinition, TrackState } from '../../../core/types/trackData';
import { DEFAULT_SINGLE_TRACK_VALUES, MAX_SAVED_MIXES } from '../constants/trackDefaults';
import type { MixerActions } from '../types/mixerContext';
import {
  createCustomTracks,
  createDefaultSingleTrackState,
  loadPreloadedTracks,
  normalizeMixTrackState,
  presetToTrackDefinition,
  withMissingTrackStates,
} from '../utils/trackBuilders';
import { DEFAULT_TRACKS, DEFAULT_GLOBAL_TEMPO } from '../../../core/data/defaultTracks';
import { buildDuplicateMixName } from '../utils/duplicateMixName';

type MixManagementParams = {
  engine: AudioEngine;
  snapshotRef: MutableRefObject<MixerSnapshot>;
  tracksRef: MutableRefObject<TrackDefinition[]>;
  activeMixIdRef: MutableRefObject<string | null>;
  setSnapshot: Dispatch<SetStateAction<MixerSnapshot>>;
  setTracks: Dispatch<SetStateAction<TrackDefinition[]>>;
  setActiveMixId: Dispatch<SetStateAction<string | null>>;
};

export type MixManagementActions = Pick<
  MixerActions,
  | 'loadMixAndPlay'
  | 'transitionToMix'
  | 'loadInitialData'
  | 'addCustomSound'
  | 'deleteCustomSound'
  | 'renameCustomSound'
  | 'replaceCustomSound'
  | 'saveMix'
  | 'loadMix'
  | 'overwriteMix'
  | 'clearMix'
  | 'resetMix'
  | 'deleteMix'
  | 'duplicateMix'
  | 'updateMix'
>;

/**
 * Builds the track-state map for a mix while honouring the two ownership rules:
 *
 * - `enabled` (whether a track is checked into the mix) is owned by the mix.
 *   It is taken solely from the mix, so unsaved checks on the previously active
 *   mix never leak into the one being loaded — a track defaults to unchecked
 *   when the mix does not mention it.
 * - All audio settings (volume, speed, EQ, effects, tempo follow) are owned by
 *   the track and shared across every mix. They are carried over from the
 *   current track state, so edits saved in the track editor remain in effect no
 *   matter which mix is loaded.
 *
 * Playback flags are reset; callers re-derive them after starting audio.
 */
const buildMixTrackStates = (
  currentTrackStates: Record<string, TrackState>,
  mix: SavedMix,
): Record<string, TrackState> => {
  const nextTrackStates: Record<string, TrackState> = {};

  for (const [trackId, currentState] of Object.entries(currentTrackStates)) {
    nextTrackStates[trackId] = {
      ...currentState,
      enabled: mix.trackStates[trackId]?.enabled ?? false,
      isPlaying: false,
      isPreviewPlaying: false,
    };
  }

  // Include any track the mix references that is not yet present in the current
  // set, so its state is available once the track definition loads. No shared
  // audio settings exist for it yet, so fall back to the mix's saved values.
  for (const [trackId, savedState] of Object.entries(mix.trackStates)) {
    if (nextTrackStates[trackId]) continue;

    nextTrackStates[trackId] = {
      ...DEFAULT_SINGLE_TRACK_VALUES,
      ...savedState,
      isPlaying: false,
      isPreviewPlaying: false,
    };
  }

  return nextTrackStates;
};

/** Marks every track as playing when enabled, used after a mix starts. */
const toPlayingTrackStates = (
  trackStates: Record<string, TrackState>,
): Record<string, TrackState> =>
  Object.fromEntries(
    Object.entries(trackStates).map(([trackId, trackState]) => [
      trackId,
      { ...trackState, isPlaying: trackState.enabled, isPreviewPlaying: false },
    ]),
  );

export const buildMixManagementActions = ({
  engine,
  snapshotRef,
  tracksRef,
  activeMixIdRef,
  setSnapshot,
  setTracks,
  setActiveMixId,
}: MixManagementParams): MixManagementActions => ({
  loadMixAndPlay: async (mixId: string, offsetSeconds = 0) => {
    const currentSnapshot = snapshotRef.current;
    const currentTracks = tracksRef.current;
    const mix = currentSnapshot.savedMixes.find((entry) => entry.id === mixId);
    if (!mix) return;

    if (currentSnapshot.transportPlaying) {
      await engine.stopTransport(true);
    }

    const nextTrackStates = buildMixTrackStates(
      currentSnapshot.trackStates,
      mix,
    );

    await engine.startTransport(
      currentTracks,
      nextTrackStates,
      currentSnapshot.customSounds,
      mix.globalTempo,
      offsetSeconds,
    );

    setSnapshot((current) => ({
      ...current,
      globalTempo: mix.globalTempo,
      trackStates: toPlayingTrackStates(nextTrackStates),
      transportPlaying: true,
    }));
  },

  transitionToMix: async (
    mixId: string,
    kind: TransitionKind,
    durationSeconds: number,
    offsetSeconds = 0,
  ) => {
    const currentSnapshot = snapshotRef.current;
    const currentTracks = tracksRef.current;
    const mix = currentSnapshot.savedMixes.find((entry) => entry.id === mixId);
    if (!mix) return;

    const nextTrackStates = buildMixTrackStates(
      currentSnapshot.trackStates,
      mix,
    );

    // The engine decides whether this overlaps (crossfade), passes through
    // silence (fade), or hard-cuts — based on `kind` and whether it is playing.
    await engine.crossfadeTo(
      currentTracks,
      nextTrackStates,
      currentSnapshot.customSounds,
      mix.globalTempo,
      { kind, durationSeconds, offsetSeconds },
    );

    setActiveMixId(mixId);
    setSnapshot((current) => ({
      ...current,
      globalTempo: mix.globalTempo,
      trackStates: toPlayingTrackStates(nextTrackStates),
      transportPlaying: true,
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
  },

  addCustomSound: async (file: File) => {
    const currentSnapshot = snapshotRef.current;
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
        ...createCustomTracks([...currentSnapshot.customSounds, record]),
      ];
    });
  },

  deleteCustomSound: async (soundId: string) => {
    const currentSnapshot = snapshotRef.current;
    await removeCustomSound(soundId);
    setSnapshot((current) => {
      const nextSounds = current.customSounds.filter(
        (sound) => sound.id !== soundId,
      );
      const nextTrackStates = { ...current.trackStates };
      delete nextTrackStates[soundId];

      return { ...current, customSounds: nextSounds, trackStates: nextTrackStates };
    });
    setTracks((current) =>
      current.filter(
        (track) => track.customSoundId !== soundId || track.kind === 'demo',
      ),
    );
    void engine.syncTrack(
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
      currentSnapshot.customSounds,
      currentSnapshot.globalTempo,
    );
  },

  replaceCustomSound: async (soundId: string, blob: Blob, mimeType: string) => {
    const currentSnapshot = snapshotRef.current;
    await replaceCustomSoundStorage(soundId, blob, mimeType);

    // Drop the stale decoded buffer so the next playback re-decodes the
    // trimmed audio rather than serving the cached full-length version.
    engine.invalidateCustomBuffer(soundId);

    const nextSounds = currentSnapshot.customSounds.map((sound) =>
      sound.id === soundId ? { ...sound, blob, mimeType } : sound,
    );

    setSnapshot((current) => ({
      ...current,
      customSounds: current.customSounds.map((sound) =>
        sound.id === soundId ? { ...sound, blob, mimeType } : sound,
      ),
    }));

    // If the trimmed sound is currently looping, restart it so the change is
    // audible immediately rather than only after the next transport start.
    const track = tracksRef.current.find(
      (entry) => entry.kind === 'custom' && entry.customSoundId === soundId,
    );
    const trackState = track
      ? currentSnapshot.trackStates[track.id]
      : undefined;

    if (track && trackState?.enabled && currentSnapshot.transportPlaying) {
      void engine.syncTrack(
        track,
        trackState,
        nextSounds,
        currentSnapshot.globalTempo,
      );
    }
  },

  renameCustomSound: async (soundId: string, name: string) => {
    await renameCustomSoundStorage(soundId, name);
    setSnapshot((current) => ({
      ...current,
      customSounds: current.customSounds.map((sound) =>
        sound.id === soundId ? { ...sound, name } : sound,
      ),
    }));
    setTracks((current) =>
      current.map((track) =>
        track.customSoundId === soundId && track.kind === 'custom'
          ? { ...track, name: name.toUpperCase() }
          : track,
      ),
    );
  },

  saveMix: (name: string, color: MixColorKey | null) => {
    const currentSnapshot = snapshotRef.current;
    const mix: SavedMix = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      createdAt: Date.now(),
      globalTempo: currentSnapshot.globalTempo,
      trackStates: Object.fromEntries(
        Object.entries(currentSnapshot.trackStates).map(
          ([trackId, trackState]) => [trackId, normalizeMixTrackState(trackState)],
        ),
      ),
    };

    if (color !== null) mix.color = color;

    const nextMixes = [mix, ...currentSnapshot.savedMixes].slice(0, MAX_SAVED_MIXES);
    persistSavedMixes(nextMixes);
    setSnapshot((current) => ({ ...current, savedMixes: nextMixes }));
  },

  loadMix: async (mixId: string) => {
    const currentSnapshot = snapshotRef.current;
    const currentTracks = tracksRef.current;
    const mix = currentSnapshot.savedMixes.find((entry) => entry.id === mixId);
    if (!mix) return;

    const wasPlaying = currentSnapshot.transportPlaying;
    if (wasPlaying) {
      await engine.stopTransport(true);
    }

    const nextTrackStates = buildMixTrackStates(
      snapshotRef.current.trackStates,
      mix,
    );

    setActiveMixId(mixId);
    setSnapshot((current) => ({
      ...current,
      globalTempo: mix.globalTempo,
      trackStates: nextTrackStates,
      transportPlaying: wasPlaying,
    }));

    if (wasPlaying) {
      await engine.startTransport(
        currentTracks,
        nextTrackStates,
        snapshotRef.current.customSounds,
        mix.globalTempo,
      );
    }
  },

  overwriteMix: (mixId: string) => {
    setSnapshot((current) => {
      const mix = current.savedMixes.find((m) => m.id === mixId);
      if (!mix) return current;
      const updated: SavedMix = {
        ...mix,
        globalTempo: current.globalTempo,
        trackStates: Object.fromEntries(
          Object.entries(current.trackStates).map(([id, state]) => [
            id,
            normalizeMixTrackState(state),
          ]),
        ),
      };
      const nextMixes = current.savedMixes.map((m) =>
        m.id === mixId ? updated : m,
      );
      persistSavedMixes(nextMixes);

      return { ...current, savedMixes: nextMixes };
    });
  },

  clearMix: async () => {
    const currentSnapshot = snapshotRef.current;
    if (currentSnapshot.transportPlaying) {
      await engine.stopTransport(true);
    }
    setActiveMixId(null);
    setSnapshot((current) => ({
      ...current,
      transportPlaying: false,
      globalTempo: DEFAULT_GLOBAL_TEMPO,
      trackStates: Object.fromEntries(
        Object.entries(current.trackStates).map(([id, state]) => [
          id,
          { ...state, enabled: false, isPlaying: false, isPreviewPlaying: false },
        ]),
      ),
    }));
  },

  resetMix: async () => {
    const currentSnapshot = snapshotRef.current;
    const currentTracks = tracksRef.current;
    const currentActiveMixId = activeMixIdRef.current;
    const mix = currentSnapshot.savedMixes.find((m) => m.id === currentActiveMixId);
    if (!mix) return;

    const wasPlaying = currentSnapshot.transportPlaying;
    if (wasPlaying) {
      await engine.stopTransport(true);
    }

    const nextTrackStates = buildMixTrackStates(
      snapshotRef.current.trackStates,
      mix,
    );

    setSnapshot((current) => ({
      ...current,
      globalTempo: mix.globalTempo,
      trackStates: nextTrackStates,
      transportPlaying: wasPlaying,
    }));

    if (wasPlaying) {
      await engine.startTransport(
        currentTracks,
        nextTrackStates,
        snapshotRef.current.customSounds,
        mix.globalTempo,
      );
    }
  },

  deleteMix: (mixId: string) => {
    const currentSnapshot = snapshotRef.current;
    const nextMixes = currentSnapshot.savedMixes.filter(
      (entry) => entry.id !== mixId,
    );
    persistSavedMixes(nextMixes);
    setSnapshot((current) => ({ ...current, savedMixes: nextMixes }));
  },

  duplicateMix: (mixId: string) => {
    const currentSnapshot = snapshotRef.current;
    const source = currentSnapshot.savedMixes.find(
      (entry) => entry.id === mixId,
    );
    if (!source) return;

    const duplicate: SavedMix = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: buildDuplicateMixName(source, currentSnapshot.savedMixes),
      createdAt: Date.now(),
      globalTempo: source.globalTempo,
      trackStates: Object.fromEntries(
        Object.entries(source.trackStates).map(([trackId, trackState]) => [
          trackId,
          { ...trackState },
        ]),
      ),
    };

    if (source.color !== undefined) duplicate.color = source.color;

    const sourceIndex = currentSnapshot.savedMixes.findIndex(
      (entry) => entry.id === mixId,
    );
    const nextMixes = [
      ...currentSnapshot.savedMixes.slice(0, sourceIndex + 1),
      duplicate,
      ...currentSnapshot.savedMixes.slice(sourceIndex + 1),
    ].slice(0, MAX_SAVED_MIXES);

    persistSavedMixes(nextMixes);
    setSnapshot((current) => ({ ...current, savedMixes: nextMixes }));
  },

  updateMix: (mixId: string, patch: MixUpdate) => {
    setSnapshot((current) => {
      const nextMixes = current.savedMixes.map((m) => {
        if (m.id !== mixId) return m;

        const updated: SavedMix = { ...m };
        if (patch.name !== undefined) updated.name = patch.name;
        if (patch.color !== undefined) {
          if (patch.color === null) {
            delete updated.color;
          } else {
            updated.color = patch.color;
          }
        }

        return updated;
      });
      persistSavedMixes(nextMixes);

      return { ...current, savedMixes: nextMixes };
    });
  },
});
