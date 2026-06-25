import type { SxProps, Theme } from '@mui/material';

/** Bottom-left panel holding the saved-set cards, beside the set timeline. */
export const panelSx: SxProps<Theme> = {
  width: '15rem',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid',
  borderColor: 'divider',
  overflow: 'hidden',
};

export const headerRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px dashed',
  borderColor: 'divider',
  px: 1.5,
  py: 1.5,
};

export const headerLabelSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: 'text.secondary',
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
  flex: 1,
  pt: 1,
};

export const emptyLabelSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
  color: 'text.disabled',
  textAlign: 'center',
  mt: 2,
  whiteSpace: 'pre-line',
};
