/**
 * Styles for the TrackEditModal dialog shell.
 * Section-level and sub-component styles live in their respective component style files.
 */

import type { SxProps, Theme } from '@mui/material';

/** Dialog paper — dark gradient tinted with track color. */
export const dialogPaperSx = (color: string): SxProps<Theme> => ({
  background: 'linear-gradient(160deg, #1a1230 0%, #0d0d1a 100%)',
  border: `1px solid ${color}44`,
  boxShadow: `0 0 40px ${color}22`,
  borderRadius: 3,
});

/** Dialog title row — flex row with track color text. */
export const dialogTitleSx = (color: string): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  pb: 1,
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.9rem',
  color,
});

/** Small colored dot next to the track name in the title. */
export const colorDotSx = (color: string): SxProps<Theme> => ({
  width: '0.625rem',
  height: '0.625rem',
  borderRadius: '50%',
  background: color,
  boxShadow: `0 0 8px ${color}`,
  flexShrink: 0,
});

/** Discard-changes icon button — pushed to the right. */
export const discardButtonSx: SxProps<Theme> = {
  ml: 'auto',
  color: 'text.disabled',
};

/** Close icon button. */
export const closeButtonSx: SxProps<Theme> = {
  color: 'text.disabled',
};
