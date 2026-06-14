/**
 * Core barrel — re-exports the consumer-facing API from every core module.
 * External feature code imports from this file only.
 */

// Types
export type { TrackKind, TrackCategory, TrackSavedSettings, TrackDefinition, PreloadedAudioFile, TrackState } from './types/trackData';
export type { CustomSoundRecord, SavedMixTrackState, SavedMix, MixerSnapshot } from './types/mixData';
export type { SessionSlot, DJSession } from './types/sessionData';

// Audio engine
export { AudioEngine } from './audio/audioEngine';
export type { PlaybackState, PlaybackListener, PlaybackHandle } from './audio/audioTypes';
export { createDemoBuffer, createImpulseResponse } from './audio/synthesis';

// Storage
export type { PersistedActiveState } from './storage/appState';
export { getState, setState } from './storage/appState';
export { loadCustomSounds, addCustomSound, removeCustomSound } from './storage/customSounds';
export { loadSavedMixes, persistSavedMixes } from './storage/mixStorage';
export type { PersistedTrackPreset, TrackOverrides } from './storage/trackPresets';
export { loadTrackPresets, persistTrackPresets, loadFavoriteIds, persistFavoriteIds, loadTrackOverrides, persistTrackOverrides } from './storage/trackPresets';
export { loadSessions, persistSessions } from './storage/sessionStorage';
