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
  cursor: isSetPlaybackActive || isActive ? 'default' : 'pointer',
  borderColor: isActive ? 'primary.main' : 'transparent',
  transition: 'opacity 0.15s, border-color 0.2s, background-color 0.2s',
  '&:hover': {
    borderColor: isActive ? 'undefined' : 'divider',
    bgcolor: '#000',
  },
  // Reveal the hover-only action buttons (edit, duplicate) when the card is
  // hovered or focused. They are removed from layout otherwise so the mix name
  // can use the freed width.
  '&:hover [data-mix-action], &:focus-within [data-mix-action]': {
    display: 'inline-flex',
  },
});

export const hoverActionButtonSx: SxProps<Theme> = {
  p: 0.25,
  color: 'text.disabled',
  display: 'none',
};

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
