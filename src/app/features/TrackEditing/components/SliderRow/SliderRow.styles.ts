import type { SxProps, Theme } from '@mui/material';

export const rowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
};

export const labelSx = (labelColor: string | undefined): SxProps<Theme> => ({
  fontFamily: 'Orbitron, monospace',
  width: '4.25rem',
  color: labelColor ?? 'text.secondary',
  fontSize: '0.875rem',
  letterSpacing: '0.05em',
  flexShrink: 0,
});

export const sliderSx = (color: string | undefined): SxProps<Theme> => ({
  color: color ?? 'secondary.main',
});

export const valueSx: SxProps<Theme> = {
  width: '4.25rem',
  textAlign: 'right',
  color: 'text.disabled',
  fontSize: '0.875rem',
  flexShrink: 0,
};
