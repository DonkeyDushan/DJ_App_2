/**
 * Styles for TrackSlidersContent — shared section label style.
 * Individual slider colors are passed as props.
 */

import type { SxProps, Theme } from '@mui/material';

/** Divider between slider groups. */
export const dividerSx: SxProps<Theme> = {
  borderColor: 'rgba(255,255,255,0.06)',
};

/** Caption label above each slider group. */
export const sectionLabelSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  color: 'text.disabled',
  fontSize: '0.6rem',
  letterSpacing: '0.1em',
};
