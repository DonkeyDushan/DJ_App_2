import type { SxProps, Theme } from '@mui/material';

export const panelSx: SxProps<Theme> = {
  width: '15rem',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  pr: 1.5,
  mr: 1.5,
};

export const headerSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: 'text.secondary',
  mb: 1,
};

export const filterRowSx: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
  mb: 1,
};

export const listSx: SxProps<Theme> = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
};

export const emptyLabelSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.65rem',
  color: 'text.disabled',
  textAlign: 'center',
  mt: 2,
  whiteSpace: 'pre-line',
};
