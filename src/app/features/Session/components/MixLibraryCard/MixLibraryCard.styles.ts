import type { SxProps, Theme } from '@mui/material';

export const cardSx = (
  isActive: boolean,
  isSetPlaying: boolean,
  isSetPlaybackActive: boolean,
): SxProps<Theme> => ({
  px: 1.5,
  py: 1,
  borderRadius: 0,
  border: 0,
  borderTop: '1px solid',
  borderBottom: '1px solid',
  cursor: isSetPlaybackActive ? 'default' : 'pointer',
  borderColor: isSetPlaying || isActive ? 'primary.main' : 'transparent',
  /*   bgcolor: isSetPlaying
      ? 'rgba(108,255,159,0.06)'
      : isActive
        ? 'rgba(255,79,220,0.06)'
        : 'transparent', */
  transition: 'opacity 0.15s, border-color 0.2s, background-color 0.2s',
  '&:hover': {
    borderColor: isActive || isSetPlaying ? 'undefined' : 'divider',
    bgcolor: '#000',
  },
});

export const rowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
};

export const mixNameSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  color: 'text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const mixMetaSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
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
