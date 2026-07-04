import type { SavedMix, SavedMixTrackState } from '../../../core/types/mixData';

/** A neutral track state used to give the demo mix a realistic track count. */
const DEMO_TRACK_STATE: SavedMixTrackState = {
  enabled: true,
  volume: 0.78,
  speed: 1,
  followsGlobalTempo: true,
  eqLow: 0,
  eqMid: 0,
  eqHigh: 0,
  reverbSend: 0,
  delaySend: 0,
};

/**
 * A throwaway example mix shown in the library **only during the tour** when the
 * user has no saved mixes yet, so the "add to set" step has a real card to point
 * at. It is never persisted and never leaves the library render list — the host
 * injects it as a prop while the tour runs and drops it when the tour ends.
 * Its id is namespaced so it can never collide with a real saved mix.
 */
export const TUTORIAL_DEMO_MIX: SavedMix = Object.freeze({
  id: 'tutorial-demo-mix',
  name: 'Demo Mix',
  createdAt: 0,
  globalTempo: 1,
  color: 'pink',
  trackStates: {
    'tutorial-demo-a': DEMO_TRACK_STATE,
    'tutorial-demo-b': DEMO_TRACK_STATE,
    'tutorial-demo-c': DEMO_TRACK_STATE,
  },
});
