import { useCallback, useEffect, useState } from 'react';

import { MIN_SELECTION_SECONDS } from '../constants/trimDimensions';
import type { TrimSelection } from '../types/trimEditor';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Owns the kept-region selection for the trim editor. Resets to the full
 * duration whenever a new buffer loads, and keeps the two bounds at least
 * `MIN_SELECTION_SECONDS` apart so the export is never empty.
 */
export const useTrimSelection = (duration: number): TrimSelection => {
  const [bounds, setBounds] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  useEffect(() => {
    setBounds({ start: 0, end: duration });
  }, [duration]);

  const setStart = useCallback((seconds: number) => {
    setBounds((prev) => {
      const maxStart = Math.max(0, prev.end - MIN_SELECTION_SECONDS);

      return { ...prev, start: clamp(seconds, 0, maxStart) };
    });
  }, []);

  const setEnd = useCallback(
    (seconds: number) => {
      setBounds((prev) => {
        const minEnd = Math.min(duration, prev.start + MIN_SELECTION_SECONDS);

        return { ...prev, end: clamp(seconds, minEnd, duration) };
      });
    },
    [duration],
  );

  return {
    startSeconds: bounds.start,
    endSeconds: bounds.end,
    setStart,
    setEnd,
  };
};
