import type { SxProps, Theme } from '@mui/material';

import {
  CURTAIN_COLOR,
  SPOTLIGHT_GLOW,
  TUTORIAL_Z_INDEX,
} from '../../constants/tutorialLayout';

/**
 * A single darkening curtain. Four of these tile the viewport around the
 * spotlight rect for the dim effect only — click blocking is handled by the
 * full-screen {@link blockerSx} layer, so curtains never capture pointer events.
 */
export const curtainSx: SxProps<Theme> = {
  position: 'fixed',
  backgroundColor: CURTAIN_COLOR,
  zIndex: TUTORIAL_Z_INDEX,
  pointerEvents: 'none',
};

/**
 * Transparent full-screen layer that swallows every pointer event so nothing
 * behind the tour — the app, the highlighted element, an open dialog — is
 * clickable. Sits above the curtains and below the popup, making the tour
 * effectively read-only: only the popup's own controls respond.
 */
export const blockerSx: SxProps<Theme> = {
  position: 'fixed',
  inset: 0,
  zIndex: TUTORIAL_Z_INDEX,
  pointerEvents: 'auto',
  backgroundColor: 'transparent',
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
