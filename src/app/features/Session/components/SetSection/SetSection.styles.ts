import type { SxProps, Theme } from '@mui/material';

export const rootSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  gap: 0.75,
};

export const headerRootSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  px: 1.5,
  py: 1.5,
  borderBottom: '1px dashed',
  borderColor: 'divider',
  flexShrink: 0,
};

export const nameInputSx: SxProps<Theme> = {
  flex: 1,
  fontFamily: 'Orbitron, monospace',
  fontSize: '1.2rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'text.primary',
  bgcolor: 'transparent',
  border: 'none',
  outline: 'none',
  p: 0,
  pb: 0.25,
  '&::placeholder': { color: 'rgba(255,255,255,0.2)' },
  '&:focus': { borderBottomColor: 'primary.main' },
};

export const durationLabelSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '1rem',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
};

export const durationInputSx: SxProps<Theme> = {
  width: '2.5rem',
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
  color: 'text.primary',
  bgcolor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 0.5,
  textAlign: 'center',
  p: 0.25,
  outline: 'none',
  '&:focus': { borderColor: 'primary.main' },
};

export const defaultTransitionButtonSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.25,
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
  bgcolor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 0.5,
  px: 0.75,
  py: 0.25,
  cursor: 'pointer',
  '&:hover': { borderColor: 'primary.main', color: 'text.primary' },
};
