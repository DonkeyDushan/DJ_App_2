/**
 * Computes loop-restart markers for the session timeline.
 *
 * Each slot plays a mix made of looping tracks. With the default tempo-synced
 * tracks every loop shares one repeat period; when loop lengths or rates
 * differ we take the longest enabled loop as the point at which the mix as a
 * whole realigns to its start. Markers are placed at every multiple of that
 * period inside the slot — the slot start itself is the mix start, not a
 * restart, so the first marker sits one period in.
 */

import type { SessionSlot } from '../../../core/types/sessionData';
import type { SavedMix } from '../../../core/types/mixData';
import type { TrackDefinition } from '../../../core/types/trackData';

/** Lower bound on playback rate; below this a loop period is meaningless. */
const MIN_VALID_RATE = 0.01;

/** A loop-restart marker positioned as a fraction (0–1) of the timeline. */
export interface LoopMarker {
  /** Stable key for React list rendering. */
  key: string;
  /** Horizontal position as a fraction of the total timeline duration. */
  fraction: number;
}

/** Builds a trackId → loop length (seconds) map for demo tracks only. */
const buildDemoLoopLengths = (
  tracks: TrackDefinition[],
): Map<string, number> => {
  const loopLengths = new Map<string, number>();
  for (const track of tracks) {
    // Custom tracks always restart at phase zero on (re)start and never
    // loop-align to the transport clock, so they have no meaningful marker.
    if (track.kind === 'demo') {
      loopLengths.set(track.id, track.loopLengthSeconds);
    }
  }

  return loopLengths;
};

/**
 * Returns the mix's repeat period in wall-clock seconds, or 0 when the mix has
 * no enabled demo tracks (no period can be derived).
 */
const resolveMixPeriodSeconds = (
  mix: SavedMix,
  loopLengths: Map<string, number>,
): number => {
  let period = 0;
  for (const [trackId, trackState] of Object.entries(mix.trackStates)) {
    if (!trackState.enabled) continue;

    const loopLength = loopLengths.get(trackId);
    if (loopLength === undefined) continue;

    const rate = trackState.followsGlobalTempo
      ? mix.globalTempo
      : trackState.speed;
    if (rate < MIN_VALID_RATE) continue;

    const effectiveLoop = loopLength / rate;
    if (effectiveLoop > period) period = effectiveLoop;
  }

  return period;
};

export const computeLoopMarkers = (
  slots: SessionSlot[],
  mixes: SavedMix[],
  tracks: TrackDefinition[],
  totalSeconds: number,
): LoopMarker[] => {
  const markers: LoopMarker[] = [];
  if (totalSeconds <= 0) return markers;

  const loopLengths = buildDemoLoopLengths(tracks);
  const mixById = new Map<string, SavedMix>();
  for (const mix of mixes) mixById.set(mix.id, mix);

  let slotStart = 0;
  for (const slot of slots) {
    const mix = mixById.get(slot.mixId);
    if (mix) {
      const period = resolveMixPeriodSeconds(mix, loopLengths);
      if (period > 0) {
        for (
          let offset = period;
          offset < slot.durationSeconds;
          offset += period
        ) {
          markers.push({
            key: `${slot.id}-${offset}`,
            fraction: (slotStart + offset) / totalSeconds,
          });
        }
      }
    }
    slotStart += slot.durationSeconds;
  }

  return markers;
};
