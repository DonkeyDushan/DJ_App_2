import type { SxProps, Theme } from '@mui/material';

export const paperSx = (isActive: boolean): SxProps<Theme> => ({
  px: 1.5,
  py: 1,
  paddingRight: 0.5,
  borderRadius: 0,
  borderColor: isActive ? 'primary.main' : 'transparent',
  boxShadow: isActive ? `0 0 14px primary.main` : 'none',
  transition: 'box-shadow 0.2s, border-color 0.2s',
  overflow: 'hidden',
});

export const rowSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { sm: 'column', xl: 'row' },
  overflow: 'hidden',
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
});

export const favButtonSx = (isFavorite: boolean): SxProps<Theme> => ({
  color: isFavorite ? '#ffd84f' : 'text.disabled',
  '&:hover': {
    color: isFavorite ? 'yellow.light' : 'secondary.light',
  },
  p: 0.5,
});

export const editButtonSx: SxProps<Theme> = {
  color: 'text.secondary',
  p: 0.5,
};
