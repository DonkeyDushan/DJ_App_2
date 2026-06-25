import { useCallback, useEffect, useRef, useState } from 'react';

import type { TrimPreview } from '../types/trimEditor';

/**
 * Plays the currently selected region once through the shared audio context.
 * Restarts from the selection start on each play and stops automatically at the
 * selection end. Any change to the selection or unmount stops playback so the
 * preview never outlives the edit it represents.
 */
export const useTrimPreview = (
  context: AudioContext | null,
  buffer: AudioBuffer | null,
  startSeconds: number,
  endSeconds: number,
): TrimPreview => {
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stop = useCallback(() => {
    const source = sourceRef.current;
    if (source) {
      source.onended = null;
      try {
        source.stop();
      } catch {
        // Source may have already ended; ignore.
      }
      source.disconnect();
      sourceRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (!context || !buffer) return;

    stop();
    void context.resume();

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.onended = () => {
      sourceRef.current = null;
      setIsPlaying(false);
    };

    const length = Math.max(0, endSeconds - startSeconds);
    source.start(0, startSeconds, length);
    sourceRef.current = source;

    setIsPlaying(true);
  }, [context, buffer, startSeconds, endSeconds, stop]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  useEffect(() => stop, [startSeconds, endSeconds, stop]);

  return { isPlaying, toggle, stop };
};
