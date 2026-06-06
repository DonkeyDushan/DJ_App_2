import type { SxProps, Theme } from '@mui/material';

export const cardSx = (isFavorite: boolean, isDragging: boolean): SxProps<Theme> => ({
  px: 1.25,
  py: 0.75,
  borderRadius: 1.5,
  cursor: 'grab',
  opacity: isDragging ? 0.4 : 1,
  borderColor: isFavorite ? '#ffd84f44' : 'rgba(255,255,255,0.06)',
  transition: 'opacity 0.15s, border-color 0.2s',
  '&:hover': { borderColor: 'rgba(255,255,255,0.18)' },
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
