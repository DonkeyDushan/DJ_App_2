/**
 * Default state values for a single track.
 * Used when initialising new tracks or resetting state.
 */

import type { TrackState } from '../../../core/types/trackData';

/** Default volume level for a newly created track. */
const DEFAULT_VOLUME = 0.78;

/** Default playback speed multiplier (1.0 = original speed). */
const DEFAULT_SPEED = 1;

/**
 * Fully zeroed-out track state used as a baseline for new or missing tracks.
 * Volume is pre-set to DEFAULT_VOLUME so newly added tracks are audible.
 */
export const DEFAULT_SINGLE_TRACK_VALUES: TrackState = Object.freeze({
  enabled: false,
  volume: DEFAULT_VOLUME,
  speed: DEFAULT_SPEED,
  followsGlobalTempo: true,
  eqLow: 0,
  eqMid: 0,
  eqHigh: 0,
  reverbSend: 0,
  delaySend: 0,
  isPlaying: false,
  isPreviewPlaying: false,
});

/**
 * Colour palette for custom sound tracks, cycling when more than 6 are added.
 */
export const CUSTOM_TRACK_PALETTE = Object.freeze([
  '#ff4fd8',
  '#40d9ff',
  '#9f6bff',
  '#ff8f4f',
  '#6cff9f',
  '#ffd84f',
]);

/**
 * Maximum number of saved mixes retained.
 * Oldest mixes beyond this limit are dropped on save.
 */
export const MAX_SAVED_MIXES = 12;

/**
 * Debounce delay in ms before persisting active state to the store.
 * Prevents flooding the IPC channel during rapid slider drags.
 */
export const PERSIST_DEBOUNCE_MS = 500;

/**
 * Storage key for the active mixer state (globalTempo + trackStates).
 */
export const ACTIVE_STATE_KEY = 'active-state';
