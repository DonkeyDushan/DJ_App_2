/**
 * Core data types for DJ sessions (set planning / timeline).
 * Used by the Session feature.
 */

import type { TransitionKind } from './transition';

export interface SessionSlot {
  id: string;
  mixId: string;
  durationSeconds: number;
  /** How the set blends into this slot from the previous one. */
  transitionKind: TransitionKind;
  /** Length of the fade/crossfade in seconds (ignored when kind is `cut`). */
  transitionDuration: number;
}

export interface DJSession {
  id: string;
  name: string;
  createdAt: number;
  totalDurationSeconds: number;
  slots: SessionSlot[];
  isFavorite: boolean;
  /** Transition kind seeded onto newly added slots. */
  defaultTransitionKind: TransitionKind;
  /** Transition duration (seconds) seeded onto newly added slots. */
  defaultTransitionDuration: number;
}
