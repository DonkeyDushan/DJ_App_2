import {
  POPUP_ESTIMATED_HEIGHT_PX,
  POPUP_GAP_PX,
  POPUP_WIDTH_PX,
  VIEWPORT_MARGIN_PX,
} from '../constants/tutorialLayout';
import type { TargetRect } from '../types/targetRect';
import type { TutorialPlacement } from '../types/tutorialStep';

/**
 * Absolute viewport position of the popup card's top-left corner, in pixels.
 * Already clamped inside the viewport, so it is applied directly with no
 * transform.
 */
export type PopupPosition = {
  readonly top: number;
  readonly left: number;
};

/** Clamps `value` into the inclusive `[min, max]` range. */
const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Computes the top-left corner at which to render the instruction popup for a
 * given target rect and placement, then clamps it so the whole card stays
 * within the viewport margins. Works from the card's estimated size, so edge
 * placements against large targets (a full-height panel, the whole track grid)
 * never fall off screen. A `null` rect or `center` placement centers the card.
 */
export const computePopupPosition = (
  rect: TargetRect | null,
  placement: TutorialPlacement,
): PopupPosition => {
  const width = POPUP_WIDTH_PX;
  const height = POPUP_ESTIMATED_HEIGHT_PX;

  const maxLeft = window.innerWidth - VIEWPORT_MARGIN_PX - width;
  const maxTop = window.innerHeight - VIEWPORT_MARGIN_PX - height;

  const centeredLeft = (window.innerWidth - width) / 2;
  const centeredTop = (window.innerHeight - height) / 2;

  if (rect === null || placement === 'center') {
    return { top: centeredTop, left: centeredLeft };
  }

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let top: number;
  let left: number;

  switch (placement) {
    case 'top':
      top = rect.top - POPUP_GAP_PX - height;
      left = centerX - width / 2;
      break;
    case 'bottom':
      top = rect.top + rect.height + POPUP_GAP_PX;
      left = centerX - width / 2;
      break;
    case 'left':
      top = centerY - height / 2;
      left = rect.left - POPUP_GAP_PX - width;
      break;
    case 'right':
      top = centerY - height / 2;
      left = rect.left + rect.width + POPUP_GAP_PX;
      break;
    default:
      top = centeredTop;
      left = centeredLeft;
      break;
  }

  return {
    top: clamp(top, VIEWPORT_MARGIN_PX, Math.max(VIEWPORT_MARGIN_PX, maxTop)),
    left: clamp(left, VIEWPORT_MARGIN_PX, Math.max(VIEWPORT_MARGIN_PX, maxLeft)),
  };
};
