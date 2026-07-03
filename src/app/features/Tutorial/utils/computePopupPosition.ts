import {
  POPUP_GAP_PX,
  POPUP_WIDTH_PX,
  VIEWPORT_MARGIN_PX,
} from '../constants/tutorialLayout';
import type { TargetRect } from '../types/targetRect';
import type { TutorialPlacement } from '../types/tutorialStep';

/**
 * Absolute geometry for the popup card, in viewport pixels. `transform` shifts
 * the card relative to the `(top, left)` anchor so the same anchor point can
 * represent different edges (e.g. the card's right edge for a `left` placement).
 */
export type PopupPosition = {
  readonly top: number;
  readonly left: number;
  readonly transform: string;
};

/** Clamps `value` into the inclusive `[min, max]` range. */
const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Places a centered, target-less popup in the middle of the viewport — used for
 * intro / outro steps.
 */
const centeredPosition = (): PopupPosition => ({
  top: window.innerHeight / 2,
  left: window.innerWidth / 2,
  transform: 'translate(-50%, -50%)',
});

/**
 * Computes where to render the instruction popup for a given target rect and
 * placement. Horizontal anchors (top/bottom) are clamped so the card's half
 * width stays on screen; vertical anchors (left/right) are clamped likewise.
 * When there is no rect (`null`) or a `center` placement, the popup is centered.
 */
export const computePopupPosition = (
  rect: TargetRect | null,
  placement: TutorialPlacement,
): PopupPosition => {
  if (rect === null || placement === 'center') {
    return centeredPosition();
  }

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const halfWidth = POPUP_WIDTH_PX / 2;

  const minCenterX = VIEWPORT_MARGIN_PX + halfWidth;
  const maxCenterX = window.innerWidth - VIEWPORT_MARGIN_PX - halfWidth;

  switch (placement) {
    case 'top':
      return {
        top: rect.top - POPUP_GAP_PX,
        left: clamp(centerX, minCenterX, maxCenterX),
        transform: 'translate(-50%, -100%)',
      };
    case 'bottom':
      return {
        top: rect.top + rect.height + POPUP_GAP_PX,
        left: clamp(centerX, minCenterX, maxCenterX),
        transform: 'translate(-50%, 0)',
      };
    case 'left':
      return {
        top: centerY,
        left: rect.left - POPUP_GAP_PX,
        transform: 'translate(-100%, -50%)',
      };
    case 'right':
      return {
        top: centerY,
        left: rect.left + rect.width + POPUP_GAP_PX,
        transform: 'translate(0, -50%)',
      };
    default:
      return centeredPosition();
  }
};
