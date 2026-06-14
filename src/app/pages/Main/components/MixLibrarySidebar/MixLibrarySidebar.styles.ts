/**
 * Styles for the MixLibrarySidebar component.
 */

import type { SxProps, Theme } from '@mui/material';

/** Left sidebar container — fixed width, scrollable. */
export const sidebarSx: SxProps<Theme> = {
  width: '15rem',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  overflow: 'hidden',
  px: 1.5,
  py: 1.5,
};
