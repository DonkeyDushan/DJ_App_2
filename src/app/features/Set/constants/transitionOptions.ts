/**
 * Selectable transition kinds and the bounds for the transition-duration
 * control, used by the per-slot editor and the set-default picker.
 */

import type { TransitionKind } from '../../../core/types/transition';

/**
 * Transition kinds in display order. The picker renders one entry per kind;
 * the component maps each kind to its label and icon at render time.
 */
export const TRANSITION_KINDS: readonly TransitionKind[] = Object.freeze([
  'cut',
  'fade',
  'crossfade',
]);

/** Minimum transition duration in seconds (only meaningful for fade/crossfade). */
export const MIN_TRANSITION_DURATION_SECONDS = 1;

/**
 * Maximum transition duration in seconds. Long enough for a slow blend while
 * staying shorter than a typical slot, so a transition never outlives its slot.
 */
export const MAX_TRANSITION_DURATION_SECONDS = 30;

/** Step in seconds for the transition-duration stepper. */
export const TRANSITION_DURATION_STEP_SECONDS = 1;
