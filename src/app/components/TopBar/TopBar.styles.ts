import type { SxProps, Theme } from '@mui/material';

export const rootSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  px: 2,
  py: 0.75,
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  flexShrink: 0,
  gap: 1,
};

export const titleSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.75rem',
  fontWeight: 900,
  letterSpacing: '0.18em',
  color: 'primary.main',
  userSelect: 'none',
};
