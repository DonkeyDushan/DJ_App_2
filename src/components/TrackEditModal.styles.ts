import type { SxProps, Theme } from '@mui/material';

export const dialogPaperSx = (color: string): SxProps<Theme> => ({
  background: 'linear-gradient(160deg, #1a1230 0%, #0d0d1a 100%)',
  border: `1px solid ${color}44`,
  boxShadow: `0 0 40px ${color}22`,
  borderRadius: 3,
});

export const dialogTitleSx = (color: string): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  pb: 1,
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.9rem',
  color,
});

export const colorDotSx = (color: string): SxProps<Theme> => ({
  width: '0.625rem',
  height: '0.625rem',
  borderRadius: '50%',
  background: color,
  boxShadow: `0 0 8px ${color}`,
  flexShrink: 0,
});

export const discardButtonSx: SxProps<Theme> = {
  ml: 'auto',
  color: 'text.disabled',
};

export const closeButtonSx: SxProps<Theme> = {
  color: 'text.disabled',
};

export const sectionLabelSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  color: 'text.disabled',
  fontSize: '0.6rem',
  letterSpacing: '0.1em',
};

export const nameLabelSx = (color: string): SxProps<Theme> => ({
  fontFamily: 'Orbitron, monospace',
  color,
  fontSize: '0.6rem',
  letterSpacing: '0.1em',
});

export const nameFieldSx = (color: string): SxProps<Theme> => ({
  mt: 0.75,
  '& .MuiInputBase-input': {
    fontFamily: 'Orbitron, monospace',
    fontSize: '0.8rem',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: `${color}66`,
  },
});

export const saveButtonSx: SxProps<Theme> = {
  fontSize: '0.7rem',
  fontFamily: 'Orbitron, monospace',
};

export const saveNewButtonSx = (color: string): SxProps<Theme> => ({
  fontSize: '0.7rem',
  fontFamily: 'Orbitron, monospace',
  background: `linear-gradient(90deg, ${color}cc, ${color}88)`,
  color: '#000',
  '&:hover': { background: color },
});

export const backButtonSx: SxProps<Theme> = {
  fontSize: '0.7rem',
  color: 'text.disabled',
  mr: 'auto',
};
