import type { SxProps, Theme } from '@mui/material';

export const editorRootSx: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  overflow: 'hidden',
};

export const controlsRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 1,
  flexShrink: 0,
};

export const nameInputSx: SxProps<Theme> = {
  flex: 1,
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'text.primary',
  bgcolor: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.12)',
  outline: 'none',
  p: 0,
  pb: 0.25,
  '&::placeholder': { color: 'rgba(255,255,255,0.2)' },
  '&:focus': { borderBottomColor: 'primary.main' },
};

export const durationLabelSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.6rem',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
};

export const durationInputSx: SxProps<Theme> = {
  width: '2.5rem',
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.65rem',
  color: 'text.primary',
  bgcolor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 0.5,
  textAlign: 'center',
  p: 0.25,
  outline: 'none',
  '&:focus': { borderColor: 'primary.main' },
};
