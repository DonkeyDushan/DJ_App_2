/**
 * Styles for the shared ConfirmDialog component.
 */

import type { SxProps, Theme } from '@mui/material';

/** Paper background and minimum width for the confirm dialog. */
export const paperSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  minWidth: '20rem',
};

/** Title typography style — Orbitron, small-caps look. */
export const titleSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
  letterSpacing: '0.1em',
  color: 'red.light',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

/** Body message typography. */
export const messageSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '1rem',
  color: 'text.secondary',
};

/** Emphasised item name shown above the message. */
export const itemNameSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1.2rem',
  fontWeight: 700,
  color: 'text.primary',
  mb: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
