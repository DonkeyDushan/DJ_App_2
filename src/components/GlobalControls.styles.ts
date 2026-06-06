import type { SxProps, Theme } from '@mui/material';

export const masterLabelSx: SxProps<Theme> = {
  color: 'secondary.main',
  letterSpacing: '0.3em',
};

export const titleSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, sans-serif',
  textShadow: '0 0 18px rgba(255,79,216,0.42)',
};

export const transportButtonSx: SxProps<Theme> = {
  minWidth: '13.75rem',
  height: '4.5rem',
  borderRadius: 3,
  fontSize: '1.25rem',
};
