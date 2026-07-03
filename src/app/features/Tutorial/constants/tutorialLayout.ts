/**
 * Stacking order for the tutorial overlay. Must sit above every in-app surface
 * including MUI dialogs/popovers (which default to the 1300–1500 range), so the
 * spotlight and instructions are never occluded.
 */
export const TUTORIAL_Z_INDEX = 2000;

/**
 * Fill colour of the darkened curtains that mask everything outside the
 * spotlight. Matches the app background (`#090812`) at high opacity so the dim
 * reads as the app receding rather than a foreign grey wash.
 */
export const CURTAIN_COLOR = 'rgba(9, 8, 18, 0.88)';

/**
 * Default padding in px added around a target's bounding rect when cutting the
 * spotlight hole, so the highlight does not clip tightly against the element's
 * own border. Individual steps may override via `paddingPx`.
 */
export const SPOTLIGHT_PADDING_PX = 8;

/** Fixed width in px of the instruction popup card. */
export const POPUP_WIDTH_PX = 340;

/**
 * Gap in px between the spotlight edge and the popup card, so the pointer/arrow
 * side of the popup does not touch the highlighted element.
 */
export const POPUP_GAP_PX = 16;

/**
 * Minimum gap in px kept between the popup and the viewport edges when its
 * anchored position would otherwise push it off screen.
 */
export const VIEWPORT_MARGIN_PX = 12;

/**
 * Neon glow drawn around the spotlight ring. Uses the primary accent so the
 * highlighted element reads as "lit up" against the dimmed surroundings.
 */
export const SPOTLIGHT_GLOW =
  '0 0 0 2px #e51c84, 0 0 18px 2px rgba(229, 28, 132, 0.55)';
