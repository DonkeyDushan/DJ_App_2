import type { SxProps, Theme } from '@mui/material';

export const sectionHeaderSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: 'text.secondary',
  mb: 0.75,
  mt: 1.5,
};

export const listSx: SxProps<Theme> = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
};

export const sessionRowSx = (isFavorite: boolean): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1,
  py: 0.5,
  borderRadius: 1,
  border: '1px solid',
  borderColor: isFavorite ? '#ffd84f33' : 'rgba(255,255,255,0.06)',
  bgcolor: 'rgba(255,255,255,0.02)',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
  transition: 'background-color 0.15s',
});

export const sessionNameSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.6rem',
  fontWeight: 600,
  color: 'text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const sessionMetaSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.55rem',
  color: 'text.secondary',
};

export const emptyLabelSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.65rem',
  color: 'text.disabled',
  textAlign: 'center',
  mt: 1,
};
