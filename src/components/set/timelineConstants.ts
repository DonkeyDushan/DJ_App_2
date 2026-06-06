export const PX_PER_SECOND = 0.5;
export const MIN_SLOT_DURATION_SECONDS = 60;
export const RULER_TICK_MINUTES = 5;

export const SLOT_COLORS = [
  '#ff4fd8',
  '#40d9ff',
  '#6cff9f',
  '#ff8f4f',
  '#c97bff',
  '#ffdf4f',
];

export const getSlotColor = (mixId: string): string => {
  const hash = mixId
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return SLOT_COLORS[hash % SLOT_COLORS.length];
};

export const formatSlotDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
};
