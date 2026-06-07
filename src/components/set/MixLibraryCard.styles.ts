import type { SxProps, Theme } from '@mui/material';

export const cardSx = (
  isFavorite: boolean,
  isDragging: boolean,
  isActive: boolean,
  isSetPlaying: boolean,
): SxProps<Theme> => ({
  px: 1.25,
  py: 0.75,
  borderRadius: 1.5,
  cursor: 'grab',
  opacity: isDragging ? 0.4 : 1,
  borderColor: isSetPlaying
    ? 'success.main'
    : isActive
      ? 'primary.main'
      : isFavorite
        ? '#ffd84f44'
        : 'rgba(255,255,255,0.06)',
  bgcolor: isSetPlaying
    ? 'rgba(108,255,159,0.06)'
    : isActive
      ? 'rgba(255,79,220,0.06)'
      : 'transparent',
  transition: 'opacity 0.15s, border-color 0.2s, background-color 0.2s',
  '&:hover': { borderColor: isActive || isSetPlaying ? undefined : 'rgba(255,255,255,0.18)' },
  '&:active': { cursor: 'grabbing' },
});

export const rowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
};

export const mixNameSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  color: 'text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const mixMetaSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.55rem',
  color: 'text.secondary',
};

export const playingDotSx: SxProps<Theme> = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  bgcolor: 'success.main',
  flexShrink: 0,
  animation: 'pulse 1.2s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.3 },
  },
};
