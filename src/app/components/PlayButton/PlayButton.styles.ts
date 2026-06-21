import { Theme } from '@emotion/react';
import { SxProps } from '@mui/material';

export const buttonSx: SxProps<Theme> = {
  borderRadius: 0,
  border: '1px solid',
  borderColor: 'primary.main',
  color: 'primary.main',
  p: 0.5,
  '&:hover': {
    borderColor: 'pink.light',
    color: 'pink.light',
    backgroundColor: 'transparent',
  },
  '&.Mui-disabled': { opacity: 0.5, color: 'primary.main' },
};
