/**
 * Pure utility functions for building and transforming track-related data.
 * No side effects, no React hooks.
 */

import {
  DEFAULT_TRACKS,
  createCustomTrackDefinition,
  createDefaultTrackState,
  createPreloadedTrackDefinitions,
} from '../../../core/data/defaultTracks';
import type { PersistedTrackPreset } from '../../../core/storage/trackPresets';
import type {
  CustomSoundRecord,
  MixerSnapshot,
  SavedMixTrackState,
} from '../../../core/types/mixData';
import type {
  TrackDefinition,
  TrackSavedSettings,
  TrackState,
} from '../../../core/types/trackData';
import { DEFAULT_GLOBAL_TEMPO } from '../../../core/data/defaultTracks';
import { CUSTOM_TRACK_PALETTE, DEFAULT_SINGLE_TRACK_VALUES } from '../constants/trackDefaults';

export const createCustomTracks = (
  customSounds: CustomSoundRecord[],
): TrackDefinition[] =>
  customSounds.map((sound, index) =>
    createCustomTrackDefinition(
      sound.id,
      sound.name.toUpperCase(),
      CUSTOM_TRACK_PALETTE[index % CUSTOM_TRACK_PALETTE.length],
      8 + (index % 4),
    ),
  );

export const createDefaultSingleTrackState = (
  savedSettings?: TrackSavedSettings,
): TrackState => ({ ...DEFAULT_SINGLE_TRACK_VALUES, ...savedSettings });

export const presetToTrackDefinition = (
  preset: PersistedTrackPreset,
  favoriteIds: Set<string>,
): TrackDefinition => ({
  id: preset.id,
  name: preset.name,
  kind: 'demo',
  category: preset.category,
  color: preset.color,
  loopLengthSeconds: preset.loopLengthSeconds,
  isFavorite: favoriteIds.has(preset.id),
  savedSettings: preset.savedSettings,
  sourceTrackId: preset.sourceTrackId,
  preloadedSrc: preset.preloadedSrc,
  customSoundId: preset.customSoundId,
});

export const loadPreloadedTracks = async (): Promise<TrackDefinition[]> => {
  try {
    const files = await window.djApp?.listPreloadedAudio?.();
    if (!files || files.length === 0) {
      return [];
    }

    return createPreloadedTrackDefinitions(files);
  } catch {
    return [];
  }
};

export const withMissingTrackStates = (
  currentStates: Record<string, TrackState>,
  trackDefinitions: TrackDefinition[],
): Record<string, TrackState> =>
  trackDefinitions.reduce(
    (states, track) => ({
      ...states,
      [track.id]: states[track.id] ?? createDefaultSingleTrackState(),
    }),
    currentStates,
  );

export const createInitialSnapshot = (): MixerSnapshot => ({
  globalTempo: DEFAULT_GLOBAL_TEMPO,
  trackStates: createDefaultTrackState(),
  customSounds: [],
  savedMixes: [],
  transportPlaying: false,
});

export const mergeTrackState = (
  trackStates: Record<string, TrackState>,
  trackId: string,
  patch: Partial<TrackState>,
): Record<string, TrackState> => {
  const current = trackStates[trackId] ?? DEFAULT_SINGLE_TRACK_VALUES;

  return {
    ...trackStates,
    [trackId]: {
      ...current,
      ...patch,
    },
  };
};

export const normalizeMixTrackState = (trackState: TrackState): SavedMixTrackState => ({
  enabled: trackState.enabled,
  volume: trackState.volume,
  speed: trackState.speed,
  followsGlobalTempo: trackState.followsGlobalTempo,
  eqLow: trackState.eqLow,
  eqMid: trackState.eqMid,
  eqHigh: trackState.eqHigh,
  reverbSend: trackState.reverbSend,
  delaySend: trackState.delaySend,
});
