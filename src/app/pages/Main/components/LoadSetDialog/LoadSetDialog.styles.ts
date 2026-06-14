/**
 * Styles for the LoadSetDialog component.
 */

import type { SxProps, Theme } from '@mui/material';

/** Paper background and minimum width for the load-set dialog. */
export const paperSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  minWidth: '22rem',
};

/** Title typography style — Orbitron, small-caps look. */
export const titleSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.75rem',
  letterSpacing: '0.1em',
};

/** Action button typography style. */
export const buttonSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.6rem',
};
