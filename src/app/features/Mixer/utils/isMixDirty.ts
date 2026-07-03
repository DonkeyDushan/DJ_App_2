/**
 * Detects whether the current working mixer state has unsaved changes relative
 * to the mix it was loaded from.
 */

import type { SavedMix } from '../../../core/types/mixData';
import type { TrackState } from '../../../core/types/trackData';

/**
 * A saved mix is defined solely by which tracks are checked into it and its
 * global tempo — those are the only values restored when the mix is loaded (see
 * `buildMixTrackStates`). Per-track audio settings (volume, EQ, effects) are
 * owned by the track and shared across every mix, so they never count as a mix
 * change. Comparison is therefore limited to the enabled set and the tempo.
 *
 * When `activeMix` is null the working state represents a brand-new mix that
 * was never saved; it counts as dirty as soon as it has any enabled track,
 * since there is something worth saving.
 */
export const isMixDirty = (
  activeMix: SavedMix | null,
  trackStates: Record<string, TrackState>,
  globalTempo: number,
): boolean => {
  if (activeMix === null) {
    for (const state of Object.values(trackStates)) {
      if (state.enabled) return true;
    }

    return false;
  }

  if (activeMix.globalTempo !== globalTempo) return true;

  // A track whose checked state differs from the saved mix is a change.
  for (const [trackId, state] of Object.entries(trackStates)) {
    const savedEnabled = activeMix.trackStates[trackId]?.enabled ?? false;
    if (state.enabled !== savedEnabled) return true;
  }

  // A track enabled in the saved mix but absent from the working state
  // (e.g. its definition failed to load) is also a change.
  for (const [trackId, savedState] of Object.entries(activeMix.trackStates)) {
    if (savedState.enabled && !(trackId in trackStates)) return true;
  }

  return false;
};
