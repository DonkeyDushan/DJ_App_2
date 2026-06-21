import type { SxProps, Theme } from '@mui/material';

export const paperSx = (isActive: boolean): SxProps<Theme> => ({
  px: 1.5,
  py: 1,
  borderRadius: 2,
  borderColor: isActive ? 'primary.main' : 'rgba(255,255,255,0.08)',
  boxShadow: isActive ? `0 0 14px primary.main` : 'none',
  transition: 'box-shadow 0.2s, border-color 0.2s',
});

export const rowSx: SxProps<Theme> = {
  gap: 0.25,
  display: 'grid',
  gridTemplateColumns: 'min-content auto',
};

export const trackNameSx = (isActive: boolean): SxProps<Theme> => ({
  flex: 1,
  fontFamily: 'Orbitron, monospace',
  color: isActive ? 'primary.main' : 'text.primary',
  fontSize: '1rem',
  letterSpacing: '0.06em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  userSelect: 'none',
});

export const starBadgeSx: SxProps<Theme> = {
  fontSize: '1rem',
  color: 'text.disabled',
  ml: 0.5,
  fontFamily: 'inherit',
};

export const playButtonSx = (isPreviewPlaying: boolean): SxProps<Theme> => ({
  color: isPreviewPlaying ? 'primary.main' : 'text.secondary',
  p: 0.5,
});

export const favButtonSx = (isFavorite: boolean): SxProps<Theme> => ({
  color: isFavorite ? '#ffd84f' : 'text.disabled',
  p: 0.5,
});

export const editButtonSx: SxProps<Theme> = {
  color: 'text.secondary',
  p: 0.5,
};
