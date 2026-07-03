import type { SxProps, Theme } from '@mui/material';

/**
 * Height reserved for the action buttons row (preview / edit / favourite).
 * A pixel icon renders at 24px and each IconButton adds 4px of vertical padding
 * (`p: 0.5`), giving a 32px = 2rem control. Reserving this height keeps the card
 * a constant height whether the hover-only buttons are revealed or hidden, so
 * hovering one track never shifts the vertical spacing of its neighbours.
 */
const ACTIONS_ROW_MIN_HEIGHT_REM = '2rem';

export const paperSx = (isActive: boolean): SxProps<Theme> => ({
  px: 1.5,
  py: 1,
  paddingRight: 0.5,
  borderRadius: 0,
  borderColor: isActive ? 'primary.main' : 'transparent',
  boxShadow: isActive ? `0 0 14px primary.main` : 'none',
  transition: 'box-shadow 0.2s, border-color 0.2s',
  overflow: 'hidden',
  // Reveal the hover-only action buttons (preview, edit, and the favourite
  // button when the track is not favourited) while the card is hovered or
  // focused. They are removed from layout otherwise so the track name can use
  // the freed width.
  '&:hover [data-track-action], &:focus-within [data-track-action]': {
    display: 'inline-flex',
  },
});

export const rowSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { sm: 'column', xl: 'row' },
  overflow: 'hidden',
  justifyContent: 'space-between',
};

export const actionsSx: SxProps<Theme> = {
  minHeight: ACTIONS_ROW_MIN_HEIGHT_REM,
};

export const checkBoxSx: SxProps<Theme> = {
  '&:hover': {
    backgroundColor: 'transparent',

    color: 'primary.light',
  },
};

export const trackNameSx: SxProps<Theme> = {
  flex: 1,
  fontFamily: 'Orbitron, monospace',
  color: 'text.primary',
  fontSize: '1rem',
  letterSpacing: '0.06em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

export const starBadgeSx: SxProps<Theme> = {
  fontSize: '1rem',
  color: 'text.disabled',
  ml: 0.5,
  fontFamily: 'inherit',
};

export const playButtonSx = (isPreviewPlaying: boolean): SxProps<Theme> => ({
  color: isPreviewPlaying ? 'primary.main' : 'text.secondary',
  '&:hover': {
    color: isPreviewPlaying ? 'primary.light' : 'secondary.light',
  },
  p: 0.5,
  display: 'none',
});

export const favButtonSx = (isFavorite: boolean): SxProps<Theme> => ({
  color: isFavorite ? '#ffd84f' : 'text.disabled',
  '&:hover': {
    color: isFavorite ? 'yellow.light' : 'secondary.light',
  },
  p: 0.5,
  // Favourited tracks keep the star visible at all times; otherwise it is
  // hover-only like the other action buttons.
  display: isFavorite ? 'inline-flex' : 'none',
});

export const editButtonSx: SxProps<Theme> = {
  color: 'text.secondary',
  p: 0.5,
  display: 'none',
};
