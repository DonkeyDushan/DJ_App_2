import type { SxProps, Theme } from '@mui/material';

/**
 * Saved-set card appearance. Mirrors the mix-library card minus drag/favourite states.
 * `dimmed` fades non-active sets while a set is playing (interactions are locked then).
 */
export const cardSx = (
  isActive: boolean,
  isSetPlaybackActive: boolean,
): SxProps<Theme> => {
  const dimmed = isSetPlaybackActive && !isActive;

  return {
    px: 1.25,
    py: 0.75,
    borderRadius: 1.5,
    cursor: isSetPlaybackActive ? 'default' : 'pointer',
    opacity: dimmed ? 0.35 : 1,
    borderColor: isActive ? 'primary.main' : 'rgba(255,255,255,0.06)',
    bgcolor: isActive ? 'rgba(255,79,220,0.06)' : 'transparent',
    transition: 'opacity 0.15s, border-color 0.2s, background-color 0.2s',
    '&:hover': {
      borderColor: isActive || dimmed ? undefined : 'rgba(255,255,255,0.18)',
    },
  };
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
