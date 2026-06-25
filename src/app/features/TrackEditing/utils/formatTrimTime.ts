/**
 * Formats a duration in seconds as `m:ss.t` (minutes, zero-padded seconds, and
 * one tenth) for the trim editor's time readouts.
 */
export const formatTrimTime = (seconds: number): string => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const wholeSeconds = Math.floor(safe % 60);
  const tenths = Math.floor((safe * 10) % 10);

  return `${minutes}:${wholeSeconds.toString().padStart(2, '0')}.${tenths}`;
};
