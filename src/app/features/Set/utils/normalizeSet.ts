/**
 * Backfills transition fields onto sessions and slots persisted before
 * per-slot transitions existed, so playback and UI never read `undefined`.
 */

import type { DJSession } from '../../../core/types/sessionData';
import {
  DEFAULT_TRANSITION_DURATION_SECONDS,
  DEFAULT_TRANSITION_KIND,
} from '../constants/sessionDefaults';

export const normalizeSession = (session: DJSession): DJSession => ({
  ...session,
  defaultTransitionKind: session.defaultTransitionKind ?? DEFAULT_TRANSITION_KIND,
  defaultTransitionDuration:
    session.defaultTransitionDuration ?? DEFAULT_TRANSITION_DURATION_SECONDS,
  slots: session.slots.map((slot) => ({
    ...slot,
    transitionKind: slot.transitionKind ?? DEFAULT_TRANSITION_KIND,
    transitionDuration:
      slot.transitionDuration ?? DEFAULT_TRANSITION_DURATION_SECONDS,
  })),
});
