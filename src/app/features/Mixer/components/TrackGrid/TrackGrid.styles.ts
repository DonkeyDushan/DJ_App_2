import type { SxProps, Theme } from '@mui/material';

export const gridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
  },
  gap: 2,
  alignItems: 'start',
};

export const columnHeaderSx = (color: string): SxProps<Theme> => ({
  display: 'block',
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.6rem',
  letterSpacing: '0.15em',
  color,
  mb: 1,
  textShadow: `0 0 8px ${color}88`,
  borderBottom: `1px solid ${color}33`,
  pb: 0.5,
});

export const columnCountSx: SxProps<Theme> = {
  fontSize: '0.55rem',
  color: 'text.disabled',
  ml: 0.75,
  fontFamily: 'inherit',
};

export const emptyColumnSx: SxProps<Theme> = {
  color: 'text.disabled',
  fontSize: '0.65rem',
  pl: 0.5,
};
