/**
 * Styles for the TrackSaveActions dialog action buttons.
 */

import type { SxProps, Theme } from '@mui/material';

/** Save (overwrite) button. */
export const saveButtonSx: SxProps<Theme> = {
  fontSize: '0.7rem',
  fontFamily: 'Orbitron, monospace',
};

/** Save-as-new / confirm button — tinted with track color. */
export const saveNewButtonSx = (color: string): SxProps<Theme> => ({
  fontSize: '0.7rem',
  fontFamily: 'Orbitron, monospace',
  background: `linear-gradient(90deg, ${color}cc, ${color}88)`,
  color: '#000',
  '&:hover': { background: color },
});

/** Back button in save-new mode. */
export const backButtonSx: SxProps<Theme> = {
  fontSize: '0.7rem',
  color: 'text.disabled',
  mr: 'auto',
};
