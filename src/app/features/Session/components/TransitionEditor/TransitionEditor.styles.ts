import type { SxProps, Theme } from '@mui/material';

export const editorRootSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
  p: 1,
  minWidth: '12rem',
};

export const toggleGroupSx: SxProps<Theme> = {
  display: 'flex',
};

export const toggleButtonSx: SxProps<Theme> = {
  flex: 1,
  py: 0.25,
  px: 0.75,
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.75rem',
  letterSpacing: '0.04em',
  textTransform: 'none',
  color: 'text.secondary',
  borderColor: 'divider',
  '&.Mui-selected': {
    color: 'primary.main',
    bgcolor: 'rgba(255,255,255,0.06)',
  },
};

export const durationRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  transition: 'opacity 0.15s',
  '&[data-disabled="true"]': { opacity: 0.4 },
};

export const durationFieldSx: SxProps<Theme> = {
  width: '3.5rem',
  px: 0.75,
  py: 0.25,
  borderRadius: '0.25rem',
  bgcolor: 'rgba(255,255,255,0.06)',
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
  '& input': { p: 0, textAlign: 'center' },
};

export const durationLabelSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
  color: 'text.disabled',
};
