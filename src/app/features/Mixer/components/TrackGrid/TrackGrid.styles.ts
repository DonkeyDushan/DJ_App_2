import type { SxProps, Theme } from '@mui/material';

export const gridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
    lg: 'repeat(6, 1fr)',
  },
  gap: 2,
  alignItems: 'stretch',
  height: '100%',
  minHeight: 0,
};

export const columnShellSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
};

export const columnScrollSx: SxProps<Theme> = {
  overflowY: 'auto',
  height: '100%',
  minHeight: 0,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    width: 0,
    height: 0,
  },
  '&:hover': {
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
      width: '0.375rem',
      height: '0.375rem',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(255, 255, 255, 0.35)',
      borderRadius: '999px',
    },
  },
};

export const columnHeaderSx: SxProps<Theme> = {
  display: 'block',
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
  letterSpacing: '0.15em',
  color: 'text.secondary',
  mb: 1,
  pb: 0.5,
  borderBottom: (theme) => `1px solid ${theme.palette.text.secondary}`,
};

export const emptyColumnSx: SxProps<Theme> = {
  color: 'text.disabled',
  fontSize: '0.875rem',
  pl: 0.5,
};
