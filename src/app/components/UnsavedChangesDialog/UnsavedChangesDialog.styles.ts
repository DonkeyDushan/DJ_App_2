/**
 * Styles for the shared UnsavedChangesDialog — the prompt shown before
 * switching away from an item (mix, set) that has unsaved changes.
 */

import type { SxProps, Theme } from '@mui/material';

/** Paper background and minimum width for the dialog. */
export const paperSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  minWidth: '24rem',
};

/** Body message typography. */
export const messageSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '1rem',
  color: 'text.secondary',
};

/** Action button typography style. */
export const buttonSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
};

/** Discard button — pushed to the left of the save actions, error-tinted. */
export const discardButtonSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
  color: 'error.main',
  mr: 'auto',
  '&:hover': {
    color: 'error.light',
  },
};
