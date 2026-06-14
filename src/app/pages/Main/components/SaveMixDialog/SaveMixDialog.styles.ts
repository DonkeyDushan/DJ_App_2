/**
 * Styles for the SaveMixDialog component.
 */

import type { SxProps, Theme } from '@mui/material';

/** Paper background and minimum width for the save-mix dialog. */
export const paperSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  minWidth: '20rem',
};

/** Title typography style — Orbitron, small-caps look. */
export const titleSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.75rem',
  letterSpacing: '0.1em',
};

/** Monospace input for the mix name field. */
export const inputSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.85rem',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 1,
  px: 1,
  py: 0.5,
  mt: 1,
  width: '100%',
};

/** Helper text below the mix name input. */
export const helperTextSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.6rem',
  color: 'text.disabled',
  mt: 1,
};

/** Action button typography style. */
export const buttonSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.6rem',
};
