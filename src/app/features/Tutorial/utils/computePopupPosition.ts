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

/**
 * Placement search order per requested side: the requested side first, then its
 * opposite, then the perpendicular sides. The tour tries each until it finds one
 * that keeps the popup off the highlighted target, so a popup never covers a
 * large target such as an open dialog.
 */
const PLACEMENT_FALLBACKS: Record<TutorialPlacement, TutorialPlacement[]> = {
  top: ['top', 'bottom', 'right', 'left'],
  bottom: ['bottom', 'top', 'right', 'left'],
  left: ['left', 'right', 'top', 'bottom'],
  right: ['right', 'left', 'bottom', 'top'],
  center: ['center'],
};

/** Clamps `value` into the inclusive `[min, max]` range. */
const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Unclamped top-left corner for a side placement, given the popup size. */
const cornerFor = (
  rect: TargetRect,
  placement: TutorialPlacement,
  width: number,
  height: number,
): { top: number; left: number } => {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  switch (placement) {
    case 'top':
      return { top: rect.top - POPUP_GAP_PX - height, left: centerX - width / 2 };
    case 'bottom':
      return {
        top: rect.top + rect.height + POPUP_GAP_PX,
        left: centerX - width / 2,
      };
    case 'left':
      return { top: centerY - height / 2, left: rect.left - POPUP_GAP_PX - width };
    case 'right':
      return {
        top: centerY - height / 2,
        left: rect.left + rect.width + POPUP_GAP_PX,
      };
    default:
      return { top: centerY - height / 2, left: centerX - width / 2 };
  }
};

/** True when two axis-aligned boxes overlap. */
const overlaps = (
  a: { top: number; left: number; width: number; height: number },
  b: TargetRect,
): boolean =>
  a.left < b.left + b.width &&
  a.left + a.width > b.left &&
  a.top < b.top + b.height &&
  a.top + a.height > b.top;

/**
 * Computes the top-left corner at which to render the instruction popup for a
 * given target rect and placement. Tries the requested side and its fallbacks,
 * returning the first clamped position that does not overlap the target; if
 * every side overlaps (a target filling the viewport), falls back to the
 * clamped requested side. A `null` rect or `center` placement centers the card.
 */
export const computePopupPosition = (
  rect: TargetRect | null,
  placement: TutorialPlacement,
): PopupPosition => {
  const width = POPUP_WIDTH_PX;
  const height = POPUP_ESTIMATED_HEIGHT_PX;

  const maxLeft = Math.max(
    VIEWPORT_MARGIN_PX,
    window.innerWidth - VIEWPORT_MARGIN_PX - width,
  );
  const maxTop = Math.max(
    VIEWPORT_MARGIN_PX,
    window.innerHeight - VIEWPORT_MARGIN_PX - height,
  );

  const centered: PopupPosition = {
    top: (window.innerHeight - height) / 2,
    left: (window.innerWidth - width) / 2,
  };

  if (rect === null || placement === 'center') {
    return centered;
  }

  let fallback: PopupPosition | null = null;

  for (const candidate of PLACEMENT_FALLBACKS[placement]) {
    const corner = cornerFor(rect, candidate, width, height);
    const position: PopupPosition = {
      top: clamp(corner.top, VIEWPORT_MARGIN_PX, maxTop),
      left: clamp(corner.left, VIEWPORT_MARGIN_PX, maxLeft),
    };

    if (fallback === null) fallback = position;

    if (!overlaps({ ...position, width, height }, rect)) {
      return position;
    }
  }

  return fallback ?? centered;
};
