/**
 * Coordinates set playback: advances through session slots on a timer,
 * stops transport at end of set, and provides seek/play-pause handlers.
 */

import { useEffect } from 'react';

import type { DJSession } from '../../../core/types/sessionData';
import type { MixerActions } from '../../../features/Mixer/types/mixerContext';

type SetPlaybackSessionActions = {
  advanceSlot: () => void;
  seekToSlot: (slotIndex: number, offsetSeconds: number) => void;
  startSetPlayback: () => void;
  stopSetPlayback: () => void;
};

type UseSetPlaybackParams = {
  setIsPlaying: boolean;
  currentSlotIndex: number | null;
  slotOffsetSeconds: number;
  activeSession: DJSession;
  mixerActions: Pick<MixerActions, 'loadMixAndPlay' | 'toggleTransport'>;
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
  // When slot changes, load the mix and schedule advancement to the next slot.
  useEffect(() => {
    if (!setIsPlaying || currentSlotIndex === null) return;
    const slot = activeSession.slots[currentSlotIndex];
    if (!slot) {
      sessionActions.stopSetPlayback();

      return;
    }

    void mixerActions.loadMixAndPlay(slot.mixId);

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

  const handleSeek = (seconds: number): void => {
    if (!setIsPlaying) return;
    const slots = activeSession.slots;
    let cumulative = 0;
    for (let i = 0; i < slots.length; i++) {
      if (seconds < cumulative + slots[i].durationSeconds) {
        sessionActions.seekToSlot(i, seconds - cumulative);

        return;
      }
      cumulative += slots[i].durationSeconds;
    }
  };

  const handleSetPlayPause = (): void => {
    if (setIsPlaying) {
      sessionActions.stopSetPlayback();
      void mixerActions.toggleTransport();

      return;
    }
    if (activeSession.slots.length === 0) return;
    sessionActions.startSetPlayback();
  };

  return { handleSeek, handleSetPlayPause };
};
