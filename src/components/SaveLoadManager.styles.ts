import type { SxProps, Theme } from '@mui/material';

export const emptyStateSx: SxProps<Theme> = {
  py: 3,
  textAlign: 'center',
  color: 'text.secondary',
};

export const listItemSx: SxProps<Theme> = {
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};
