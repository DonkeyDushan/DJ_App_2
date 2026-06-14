import type { SxProps, Theme } from '@mui/material';

export const paperSx = (color: string, isActive: boolean): SxProps<Theme> => ({
  px: 1.5,
  py: 1,
  borderRadius: 2,
  borderColor: isActive ? color : 'rgba(255,255,255,0.08)',
  boxShadow: isActive ? `0 0 14px ${color}44` : 'none',
  transition: 'box-shadow 0.2s, border-color 0.2s',
  background: isActive
    ? `linear-gradient(135deg, ${color}14 0%, transparent 60%)`
    : undefined,
});

export const rowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.25,
};

export const trackNameSx = (
  color: string,
  isActive: boolean,
): SxProps<Theme> => ({
  flex: 1,
  fontFamily: 'Orbitron, monospace',
  color: isActive ? color : 'text.primary',
  fontSize: '0.7rem',
  letterSpacing: '0.06em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  userSelect: 'none',
});

export const starBadgeSx: SxProps<Theme> = {
  fontSize: '0.6rem',
  color: 'text.disabled',
  ml: 0.5,
  fontFamily: 'inherit',
};

export const playButtonSx = (
  color: string,
  isPreviewPlaying: boolean,
): SxProps<Theme> => ({
  color: isPreviewPlaying ? color : 'text.secondary',
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
