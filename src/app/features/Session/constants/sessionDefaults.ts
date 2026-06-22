/**
 * Default values for new sessions and slots.
 */

import type { TransitionKind } from '../../../core/types/transition';

/** Default total session duration in seconds. */
export const DEFAULT_TOTAL_DURATION_SECONDS = 600;

/** Default duration for a newly added slot in seconds. */
export const DEFAULT_SLOT_DURATION_SECONDS = 300;

/** Default transition duration between slots in seconds. */
export const DEFAULT_TRANSITION_DURATION_SECONDS = 8;

/** Default transition kind for new slots and new sets. */
export const DEFAULT_TRANSITION_KIND: TransitionKind = 'crossfade';
