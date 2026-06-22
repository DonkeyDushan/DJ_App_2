/**
 * Coordinates set playback: advances through session slots on a timer,
 * stops transport at end of set, and provides seek/play-pause handlers.
 */

import { useCallback, useEffect, useRef } from 'react';

import type { DJSession } from '../../../core/types/sessionData';
import type { TransitionKind } from '../../../core/types/transition';
import type { MixerActions } from '../../../features/Mixer/types/mixerContext';

/** Transition kind used for initial start, seek, and scrub (no blend). */
const IMMEDIATE_TRANSITION_KIND: TransitionKind = 'cut';

type SetPlaybackSessionActions = {
  advanceSlot: () => void;
  seekToSlot: (slotIndex: number, offsetSeconds: number) => void;
  startSetPlayback: () => void;
  pauseSetPlayback: () => void;
  resumeSetPlayback: () => void;
  stopSetPlayback: () => void;
};

type UseSetPlaybackParams = {
  setIsPlaying: boolean;
  currentSlotIndex: number | null;
  slotOffsetSeconds: number;
  activeSession: DJSession;
  mixerActions: Pick<MixerActions, 'transitionToMix' | 'toggleTransport'>;
  sessionActions: SetPlaybackSessionActions;
};

type UseSetPlaybackResult = {
  handleSeek: (seconds: number) => void;
  handleSetPlayPause: () => void;
};

export const useSetPlayback = ({
  setIsPlaying,
  currentSlotIndex,
  slotOffsetSeconds,
  activeSession,
  mixerActions,
  sessionActions,
}: UseSetPlaybackParams): UseSetPlaybackResult => {
  // Tracks the slot that was loaded last so the next load can tell a natural
  // advance (slot i entered from i-1 at offset 0 — apply the slot's transition)
  // from an initial start, seek, or scrub (hard cut).
  const loadedSlotIndexRef = useRef<number | null>(null);

  // Load the active slot's mix and align its loops to the in-slot offset.
  // Reruns when the slot changes (advance, or seek into another slot) and when
  // the offset changes (seek within the same slot): in every case the mix is
  // (re)started at the loop phase it would occupy had the set played from the
  // start, so the DJ auditions transitions exactly as they will sound live.
  useEffect(() => {
    if (!setIsPlaying || currentSlotIndex === null) {
      loadedSlotIndexRef.current = null;

      return;
    }
    const slot = activeSession.slots[currentSlotIndex];
    if (!slot) {
      sessionActions.stopSetPlayback();

      return;
    }

    const previousIndex = loadedSlotIndexRef.current;
    const isNaturalAdvance =
      previousIndex !== null &&
      currentSlotIndex === previousIndex + 1 &&
      slotOffsetSeconds === 0;
    const kind = isNaturalAdvance
      ? slot.transitionKind
      : IMMEDIATE_TRANSITION_KIND;
    const durationSeconds = isNaturalAdvance ? slot.transitionDuration : 0;

    loadedSlotIndexRef.current = currentSlotIndex;
    void mixerActions.transitionToMix(
      slot.mixId,
      kind,
      durationSeconds,
      slotOffsetSeconds,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsPlaying, currentSlotIndex, slotOffsetSeconds]);

  // Schedule advancement to the next slot based on the time remaining in the
  // current slot. Reruns on seek so the timer reflects the new playhead offset.
  useEffect(() => {
    if (!setIsPlaying || currentSlotIndex === null) return undefined;
    const slot = activeSession.slots[currentSlotIndex];
    if (!slot) return undefined;

    const remaining = Math.max(0, slot.durationSeconds - slotOffsetSeconds);
    const timer = setTimeout(() => {
      const next = currentSlotIndex + 1;
      if (next < activeSession.slots.length) {
        sessionActions.advanceSlot();
      } else {
        sessionActions.stopSetPlayback();
        void mixerActions.toggleTransport();
      }
    }, remaining * 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsPlaying, currentSlotIndex, slotOffsetSeconds]);

  // Maps a global timeline position to a (slot, offset) pair and records it as
  // the playback position. Runs while playing (live seek) and while paused
  // (capturing the pause position so resume continues from the same point).
  const handleSeek = useCallback(
    (seconds: number): void => {
      const { slots } = activeSession;
      let cumulative = 0;
      for (let i = 0; i < slots.length; i++) {
        if (seconds < cumulative + slots[i].durationSeconds) {
          sessionActions.seekToSlot(i, seconds - cumulative);

          return;
        }
        cumulative += slots[i].durationSeconds;
      }
    },
    [activeSession.slots, sessionActions],
  );

  const handleSetPlayPause = useCallback((): void => {
    if (setIsPlaying) {
      sessionActions.pauseSetPlayback();
      void mixerActions.toggleTransport();

      return;
    }
    if (activeSession.slots.length === 0) return;

    // Resume from the preserved position when a slot is still loaded; otherwise
    // start a fresh run from the beginning of the set.
    if (currentSlotIndex !== null) {
      sessionActions.resumeSetPlayback();
    } else {
      sessionActions.startSetPlayback();
    }
  }, [setIsPlaying, currentSlotIndex, activeSession.slots, sessionActions, mixerActions]);

  return { handleSeek, handleSetPlayPause };
};
