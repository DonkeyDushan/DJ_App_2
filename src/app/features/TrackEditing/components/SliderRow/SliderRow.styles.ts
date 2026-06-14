import type { SxProps, Theme } from '@mui/material';

export const rowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
};

export const labelSx = (color: string | undefined): SxProps<Theme> => ({
  fontFamily: 'Orbitron, monospace',
  width: '3.25rem',
  color: color ?? 'text.secondary',
  fontSize: '0.65rem',
  letterSpacing: '0.05em',
  flexShrink: 0,
});

export const sliderSx = (color: string | undefined): SxProps<Theme> => ({
  color: color ?? 'secondary.main',
});

export const valueSx: SxProps<Theme> = {
  width: '2.25rem',
  textAlign: 'right',
  color: 'text.disabled',
  fontSize: '0.65rem',
  flexShrink: 0,
};
