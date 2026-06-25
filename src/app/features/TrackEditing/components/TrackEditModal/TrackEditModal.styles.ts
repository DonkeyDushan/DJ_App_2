/**
 * Styles for the TrackEditModal dialog shell.
 * Section-level and sub-component styles live in their respective component style files.
 */

import type { SxProps, Theme } from '@mui/material';

/** Reset-to-defaults icon button — leftmost of the right-aligned action group. */
export const resetButtonSx: SxProps<Theme> = {
  ml: 'auto',
  color: 'text.disabled',
};

/** Discard-changes icon button — sits between reset and close. */
export const discardButtonSx: SxProps<Theme> = {
  color: 'text.disabled',
};

/** Close icon button. */
export const closeButtonSx: SxProps<Theme> = {
  color: 'text.disabled',
};
