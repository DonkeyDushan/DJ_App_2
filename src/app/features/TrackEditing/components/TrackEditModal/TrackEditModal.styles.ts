/**
 * Styles for the TrackEditModal dialog shell.
 * Section-level and sub-component styles live in their respective component style files.
 */

import type { SxProps, Theme } from '@mui/material';

/** Discard-changes icon button — pushed to the right. */
export const discardButtonSx: SxProps<Theme> = {
  ml: 'auto',
  color: 'text.disabled',
};

/** Close icon button. */
export const closeButtonSx: SxProps<Theme> = {
  color: 'text.disabled',
};
