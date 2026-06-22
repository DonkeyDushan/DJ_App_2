import type { SxProps, Theme } from '@mui/material';

/**
 * Saved-set card appearance. Mirrors the mix-library card minus drag/favourite states.
 * `dimmed` fades non-active sets while a set is playing (interactions are locked then).
 */
export const cardSx = (isActive: boolean): SxProps<Theme> => ({
  px: 1.5,
  py: 1,
  borderRadius: 0,
  border: 0,
  borderTop: '1px solid',
  borderBottom: '1px solid',
  cursor: isActive ? 'default' : 'pointer',
  borderColor: isActive ? 'primary.main' : 'transparent',
  transition: 'opacity 0.15s, border-color 0.2s, background-color 0.2s',
  '&:hover': {
    borderColor: isActive ? 'undefined' : 'divider',
    bgcolor: '#000',
  },
});

export const rowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
};

export const setNameSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  color: 'text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const setMetaSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
  color: 'text.secondary',
};
