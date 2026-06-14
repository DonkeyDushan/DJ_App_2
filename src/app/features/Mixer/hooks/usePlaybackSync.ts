/**
 * Subscribes to the audio engine's playback state events and mirrors them
 * into the mixer snapshot so the UI reflects the true playback state.
 */

import { useEffect } from 'react';

import type { AudioEngine } from '../../../core/audio/audioEngine';
import type { MixerSnapshot } from '../../../core/types/mixData';
import { mergeTrackState } from '../utils/trackBuilders';

type SetSnapshot = React.Dispatch<React.SetStateAction<MixerSnapshot>>;

export const usePlaybackSync = (
  engine: AudioEngine,
  setSnapshot: SetSnapshot,
): void => {
  useEffect(() => {
    const unsubscribe = engine.subscribeToPlayback((trackId, playbackState) => {
      setSnapshot((current) => {
        const currentTrackState = current.trackStates[trackId];
        if (!currentTrackState) {
          return current;
        }

        if (
          currentTrackState.isPlaying === playbackState.isPlaying &&
          currentTrackState.isPreviewPlaying === playbackState.isPreviewPlaying
        ) {
          return current;
        }

        return {
          ...current,
          trackStates: mergeTrackState(current.trackStates, trackId, {
            isPlaying: playbackState.isPlaying,
            isPreviewPlaying: playbackState.isPreviewPlaying,
          }),
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [engine, setSnapshot]);
};
