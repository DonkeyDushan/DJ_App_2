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
  // Reveal the row action buttons only while the card is hovered or holds
  // focus. They are removed from layout otherwise so the set name can use the
  // freed width.
  '&:hover [data-set-action], &:focus-within [data-set-action]': {
    display: 'inline-flex',
  },
});

export const actionButtonSx: SxProps<Theme> = {
  p: 0.25,
  color: 'text.disabled',
  display: 'none',
  transition: 'color 0.2s',
};

export const deleteButtonSx: SxProps<Theme> = {
  ...actionButtonSx,
  '&:hover': { color: 'red.light' },
};

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
