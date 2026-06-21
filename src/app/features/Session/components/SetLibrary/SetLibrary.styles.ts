import type { SxProps, Theme } from '@mui/material';

/** Bottom-left panel holding the saved-set cards, beside the set timeline. */
export const panelSx: SxProps<Theme> = {
  width: '15rem',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  pl: 1.5,
  pr: 1.5,
  py: 1,
  overflow: 'hidden',
};

export const headerRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 1,
  flexShrink: 0,
};

export const headerLabelSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: 'text.secondary',
};

export const newSetButtonSx: SxProps<Theme> = {
  py: 0.25,
  px: 0.75,
  fontSize: '0.875rem',
  minWidth: 0,
  letterSpacing: '0.06em',
  fontFamily: 'Orbitron, monospace',
};

/**
 * Relative wrapper for the absolutely positioned list. Absolute positioning keeps the
 * card count out of the flex height calculation, so the panel stretches to the set
 * section height (driven by the timeline) instead of growing with the number of sets.
 */
export const listWrapperSx: SxProps<Theme> = {
  position: 'relative',
  flex: 1,
  minHeight: 0,
};

export const listSx: SxProps<Theme> = {
  position: 'absolute',
  inset: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
};

export const emptyLabelSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
  color: 'text.disabled',
  textAlign: 'center',
  mt: 2,
  whiteSpace: 'pre-line',
};
