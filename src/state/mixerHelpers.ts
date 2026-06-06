import {
  DEFAULT_GLOBAL_TEMPO,
  DEFAULT_TRACKS,
  createCustomTrackDefinition,
  createDefaultTrackState,
  createPreloadedTrackDefinitions,
} from '../data/defaultTracks';
import { loadSavedMixes } from '../storage/mixStorage';
import type { PersistedTrackPreset } from '../storage/trackPresets';
import type {
  CustomSoundRecord,
  MixerSnapshot,
  SavedMixTrackState,
  TrackDefinition,
  TrackSavedSettings,
  TrackState,
} from '../types';

export const CUSTOM_TRACK_PALETTE = [
  '#ff4fd8',
  '#40d9ff',
  '#9f6bff',
  '#ff8f4f',
  '#6cff9f',
  '#ffd84f',
];

export const DEFAULT_SINGLE_TRACK_VALUES: TrackState = {
  enabled: false,
  volume: 0.78,
  speed: 1,
  followsGlobalTempo: true,
  eqLow: 0,
  eqMid: 0,
  eqHigh: 0,
  reverbSend: 0,
  delaySend: 0,
  isPlaying: false,
  isPreviewPlaying: false,
};

export function createCustomTracks(
  customSounds: CustomSoundRecord[],
): TrackDefinition[] {
  return customSounds.map((sound, index) =>
    createCustomTrackDefinition(
      sound.id,
      sound.name.toUpperCase(),
      CUSTOM_TRACK_PALETTE[index % CUSTOM_TRACK_PALETTE.length],
      8 + (index % 4),
    ),
  );
}

export function createDefaultSingleTrackState(
  savedSettings?: TrackSavedSettings,
): TrackState {
  return { ...DEFAULT_SINGLE_TRACK_VALUES, ...savedSettings };
}

export function presetToTrackDefinition(
  preset: PersistedTrackPreset,
  favoriteIds: Set<string>,
): TrackDefinition {
  return {
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
  };
}

export async function loadPreloadedTracks(): Promise<TrackDefinition[]> {
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

export function withMissingTrackStates(
  currentStates: Record<string, TrackState>,
  trackDefinitions: TrackDefinition[],
): Record<string, TrackState> {
  return trackDefinitions.reduce(
    (states, track) => ({
      ...states,
      [track.id]: states[track.id] ?? createDefaultSingleTrackState(),
    }),
    currentStates,
  );
}

export function createInitialSnapshot(): MixerSnapshot {
  return {
    globalTempo: DEFAULT_GLOBAL_TEMPO,
    trackStates: createDefaultTrackState(),
    customSounds: [],
    savedMixes: loadSavedMixes(),
    transportPlaying: false,
  };
}

export function mergeTrackState(
  trackStates: Record<string, TrackState>,
  trackId: string,
  patch: Partial<TrackState>,
): Record<string, TrackState> {
  const current = trackStates[trackId] ?? DEFAULT_SINGLE_TRACK_VALUES;

  return {
    ...trackStates,
    [trackId]: {
      ...current,
      ...patch,
    },
  };
}

export function normalizeMixTrackState(trackState: TrackState): SavedMixTrackState {
  return {
    enabled: trackState.enabled,
    volume: trackState.volume,
    speed: trackState.speed,
    followsGlobalTempo: trackState.followsGlobalTempo,
    eqLow: trackState.eqLow,
    eqMid: trackState.eqMid,
    eqHigh: trackState.eqHigh,
    reverbSend: trackState.reverbSend,
    delaySend: trackState.delaySend,
  };
}

