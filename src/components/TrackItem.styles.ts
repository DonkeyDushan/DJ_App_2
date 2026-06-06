import type { SxProps, Theme } from '@mui/material';

export const paperSx = (color: string, isPlaying: boolean): SxProps<Theme> => ({
  p: 2,
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 4,
  borderColor: isPlaying ? color : 'rgba(255,255,255,0.08)',
  boxShadow: isPlaying
    ? `0 0 0 1px ${color}66, 0 0 22px ${color}55, inset 0 0 22px ${color}12`
    : 'none',
});

export const glowOverlaySx = (color: string): SxProps<Theme> => ({
  position: 'absolute',
  inset: 0,
  opacity: 0.16,
  background: `radial-gradient(circle at top right, ${color}88, transparent 45%)`,
  pointerEvents: 'none',
});

export const trackNameSx = (color: string): SxProps<Theme> => ({
  fontFamily: 'Orbitron, sans-serif',
  color,
});

export const statusBadgeSx = (
  color: string,
  isPlaying: boolean,
): SxProps<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  color: isPlaying ? color : 'text.secondary',
  fontSize: '0.75rem',
  letterSpacing: '0.16em',
});

export const playButtonSx = (color: string): SxProps<Theme> => ({
  borderColor: `${color}88`,
  color: '#fff',
});

export const sliderLabelSx: SxProps<Theme> = {
  display: 'block',
  mb: 0.5,
  color: 'text.secondary',
};

export const eqLabelSx: SxProps<Theme> = {
  display: 'block',
  color: 'text.secondary',
};

export const controlLabelSx = (width: string): SxProps<Theme> => ({
  width,
  color: 'text.secondary',
});
