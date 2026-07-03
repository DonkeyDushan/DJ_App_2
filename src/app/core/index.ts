/**
 * Core barrel — re-exports the consumer-facing API from every core module.
 * External feature code imports from this file only.
 */

// Types
export type { TrackKind, TrackCategory, TrackSavedSettings, TrackDefinition, PreloadedAudioFile, TrackState } from './types/trackData';
export type { CustomSoundRecord, SavedMixTrackState, SavedMix, MixUpdate, MixerSnapshot } from './types/mixData';
export type { SetSlot, DJSet } from './types/setData';

// Constants
export { MIX_COLOR_KEYS } from './constants/mixColors';
export type { MixColorKey } from './constants/mixColors';

// Audio engine
export { AudioEngine } from './audio/audioEngine';
export type { PlaybackState, PlaybackListener, PlaybackHandle } from './audio/audioTypes';
export { createDemoBuffer, createImpulseResponse } from './audio/synthesis';
export { encodeWavRegion, WAV_MIME_TYPE } from './audio/wavEncoder';
export { fixWebmDuration } from './audio/webmDurationFixer';

// Storage
export type { PersistedActiveState } from './storage/appState';
export { getState, setState } from './storage/appState';
export { loadCustomSounds, addCustomSound, removeCustomSound } from './storage/customSounds';
export { loadSavedMixes, persistSavedMixes } from './storage/mixStorage';
export type { PersistedTrackPreset, TrackOverrides } from './storage/trackPresets';
export { loadTrackPresets, persistTrackPresets, loadFavoriteIds, persistFavoriteIds, loadTrackOverrides, persistTrackOverrides } from './storage/trackPresets';
export { loadSets, persistSets } from './storage/setStorage';

// Session
export {
  saveSessionToFile,
  loadSessionFromFile,
  startNewSession,
} from './session/sessionClient';
export type { SessionLoadOutcome } from './session/sessionClient';
export {
  markSessionDirty,
  clearSessionDirty,
  activateSessionDirty,
} from './session/sessionDirtyStore';
export { useSessionDirty } from './session/useSessionDirty';
