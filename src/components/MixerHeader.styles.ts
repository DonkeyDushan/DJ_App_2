import type { SxProps, Theme } from '@mui/material';

export const headerRootSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  px: 1.5,
  py: 1,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
  position: 'relative',
};

export const tempoGroupSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
};

export const bpmLabelSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.55rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: 'text.secondary',
  userSelect: 'none',
};

export const bpmValueSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.85rem',
  color: 'primary.main',
  minWidth: '2.2rem',
  userSelect: 'none',
};

export const lockOverlaySx: SxProps<Theme> = {
  position: 'absolute',
  inset: 0,
  bgcolor: 'rgba(0,0,0,0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  backdropFilter: 'blur(2px)',
};
