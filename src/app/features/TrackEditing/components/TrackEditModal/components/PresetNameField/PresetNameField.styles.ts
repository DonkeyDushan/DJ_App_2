/**
 * Styles for the PresetNameField component.
 */

import type { SxProps, Theme } from '@mui/material';

/** Caption label above the preset name input. */
export const nameLabelSx = (color: string): SxProps<Theme> => ({
  fontFamily: 'Orbitron, monospace',
  color,
  fontSize: '0.6rem',
  letterSpacing: '0.1em',
});

/** Outlined text field styled to match the track color. */
export const nameFieldSx = (color: string): SxProps<Theme> => ({
  mt: 0.75,
  '& .MuiInputBase-input': {
    fontFamily: 'Orbitron, monospace',
    fontSize: '0.8rem',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: `${color}66`,
  },
});

/** Divider tinted with the track color. */
export const dividerSx = (color: string): SxProps<Theme> => ({
  borderColor: `${color}44`,
});
