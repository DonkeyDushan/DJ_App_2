/**
 * Styles for the shared NameInputDialog component.
 */

import type { SxProps, Theme } from '@mui/material';

/** Paper background and minimum width for the dialog. */
export const paperSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  minWidth: '20rem',
};

/** Title typography style — Orbitron, small-caps look. */
export const titleSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
  letterSpacing: '0.1em',
};

/** Monospace input for the name field. */
export const inputSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '1rem',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 1,
  px: 1,
  py: 0.5,
  mt: 1,
  width: '100%',
};

/** Helper text below the input. */
export const helperTextSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '1rem',
  color: 'text.disabled',
  mt: 1,
};

/** Action button typography style. */
export const buttonSx: SxProps<Theme> = {
  fontSize: '1rem',
};
