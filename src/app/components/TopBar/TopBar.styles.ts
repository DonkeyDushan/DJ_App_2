import type { SxProps, Theme } from '@mui/material';

export const rootSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  px: 1.5,
  py: 0.75,
  borderBottom: '1px solid',
  borderColor: 'divider',
  flexShrink: 0,
  gap: 1,
  backgroundColor: '#000',
};

export const titleSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
  fontWeight: 900,
  letterSpacing: '0.18em',
  color: 'primary.main',
  userSelect: 'none',
};

export const dirtyDotSx: SxProps<Theme> = {
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: 'transparent',
  transition: 'background-color 0.2s',
  '&[data-dirty="true"]': {
    backgroundColor: 'warning.main',
  },
};

export const actionsSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  ml: 'auto',
};
