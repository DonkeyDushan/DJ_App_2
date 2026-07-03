import type { SxProps, Theme } from '@mui/material';

import {
  CURTAIN_COLOR,
  SPOTLIGHT_GLOW,
  TUTORIAL_Z_INDEX,
} from '../../constants/tutorialLayout';

/**
 * A single darkening curtain. Four of these tile the viewport around the
 * spotlight rect, leaving the highlighted element uncovered and fully
 * interactive. Each curtain captures pointer events so the rest of the app
 * cannot be clicked during the tour.
 */
export const curtainSx: SxProps<Theme> = {
  position: 'fixed',
  backgroundColor: CURTAIN_COLOR,
  zIndex: TUTORIAL_Z_INDEX,
  pointerEvents: 'auto',
};

/**
 * Full-screen dark backdrop for target-less (centered) steps. Clicking it does
 * nothing; the tour is driven by the popup buttons and keyboard.
 */
export const backdropSx: SxProps<Theme> = {
  position: 'fixed',
  inset: 0,
  backgroundColor: CURTAIN_COLOR,
  zIndex: TUTORIAL_Z_INDEX,
  pointerEvents: 'auto',
};

/**
 * Neon ring drawn on top of the spotlight hole. Purely decorative — it never
 * captures pointer events, so hover and clicks reach the real element beneath.
 */
export const ringSx: SxProps<Theme> = {
  position: 'fixed',
  zIndex: TUTORIAL_Z_INDEX,
  pointerEvents: 'none',
  boxShadow: SPOTLIGHT_GLOW,
  borderRadius: 0,
};
