/**
 * Backfills transition fields onto sets and slots persisted before
 * per-slot transitions existed, so playback and UI never read `undefined`.
 */

import type { DJSet } from '../../../core/types/setData';
import {
  DEFAULT_TRANSITION_DURATION_SECONDS,
  DEFAULT_TRANSITION_KIND,
} from '../constants/setDefaults';

export const normalizeSet = (set: DJSet): DJSet => ({
  ...set,
  defaultTransitionKind: set.defaultTransitionKind ?? DEFAULT_TRANSITION_KIND,
  defaultTransitionDuration:
    set.defaultTransitionDuration ?? DEFAULT_TRANSITION_DURATION_SECONDS,
  slots: set.slots.map((slot) => ({
    ...slot,
    transitionKind: slot.transitionKind ?? DEFAULT_TRANSITION_KIND,
    transitionDuration:
      slot.transitionDuration ?? DEFAULT_TRANSITION_DURATION_SECONDS,
  })),
});
