/**
 * Styles for the TrackEditModal dialog shell.
 * Section-level and sub-component styles live in their respective component style files.
 */

import type { SxProps, Theme } from '@mui/material';

/** Preview play/pause icon button — leftmost of the title bar, balancing the
 * right-aligned action group. Highlights while the one-shot preview plays. */
export const previewButtonSx = (isPreviewPlaying: boolean): SxProps<Theme> => ({
  color: isPreviewPlaying ? 'primary.main' : 'text.disabled',
  '&:hover': {
    color: isPreviewPlaying ? 'primary.light' : 'text.secondary',
  },
});

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
