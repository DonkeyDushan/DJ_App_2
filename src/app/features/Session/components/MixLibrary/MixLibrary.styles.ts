import type { SxProps, Theme } from '@mui/material';

export const panelSx: SxProps<Theme> = {
  width: '15rem',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid',
  borderColor: 'divider',

  overflow: 'hidden',
};

export const headerRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px dashed',
  borderColor: 'divider',
  px: 1.5,
  py: 1.5,
};

export const filterRowSx: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
  mb: 1,
};

export const listSx: SxProps<Theme> = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
};

export const emptyLabelSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
  color: 'text.disabled',
  textAlign: 'center',
  mt: 2,
  whiteSpace: 'pre-line',
};
