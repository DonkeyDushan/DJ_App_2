/**
 * Styles for the MixEditDialog — rename field, color swatch picker,
 * and destructive/confirm actions.
 */

import type { SxProps, Theme } from '@mui/material';

import type { MixColorKey } from '../../../../core';

/** Paper background and minimum width for the dialog. */
export const paperSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  minWidth: '22rem',
};

/** Monospace input for the name field. */
export const inputSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '1rem',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 1,
  px: 1,
  py: 0.5,
  width: '100%',
};

/** Small section label above the color picker row. */
export const colorLabelSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.75rem',
  letterSpacing: '0.1em',
  color: 'text.secondary',
  mt: 2,
  mb: 1,
};

/** Wrapping row that holds the color swatches. */
export const swatchRowSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 1,
  alignItems: 'center',
  width: '100%',
  justifyContent: 'space-between',
};

/** A single color swatch — fills from the matching theme palette key. */
export const swatchSx = (
  paletteKey: MixColorKey,
  selected: boolean,
): SxProps<Theme> => ({
  width: '1.75rem',
  height: '1.75rem',
  borderRadius: '50%',
  bgcolor: `${paletteKey}.main`,
  cursor: 'pointer',
  border: '2px solid',
  borderColor: selected ? 'text.primary' : 'transparent',
  boxShadow: selected ? '0 0 8px rgba(255,255,255,0.45)' : 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
});

/** The "no color" swatch — an outlined circle with a strike-through. */
export const clearSwatchSx = (selected: boolean): SxProps<Theme> => ({
  width: '1.75rem',
  height: '1.75rem',
  borderRadius: '50%',
  cursor: 'pointer',
  border: '2px solid',
  borderColor: selected ? 'text.primary' : 'rgba(255,255,255,0.25)',
  boxShadow: selected ? '0 0 8px rgba(255,255,255,0.45)' : 'none',
  position: 'relative',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '15%',
    right: '15%',
    height: '1px',
    bgcolor: 'rgba(255,255,255,0.4)',
    transform: 'rotate(-45deg)',
  },
});

/** Action button typography style. */
export const buttonSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
};

/** Delete button — pushed to the left, error-tinted. */
export const deleteButtonSx: SxProps<Theme> = {
  fontSize: '1rem',
  color: 'error.main',
  mr: 'auto',
  '&:hover': {
    color: 'error.light',
  },
};
