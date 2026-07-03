import { useEffect, useState } from 'react';

import type { TargetRect } from '../types/targetRect';

/**
 * Attribute set on the currently spotlighted element while its step is active.
 * Components can react to it in CSS — e.g. a track card reveals its hover-only
 * action buttons when `[data-tutorial-highlight="true"]`, so the tour can point
 * at controls the user is not physically hovering.
 */
const HIGHLIGHT_ATTRIBUTE = 'data-tutorial-highlight';

/** Rounds a DOMRect down to the plain fields we track, in viewport space. */
const toTargetRect = (element: Element): TargetRect => {
  const rect = element.getBoundingClientRect();

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
};

/**
 * Resolves `selector` against the live DOM and returns its rect in viewport
 * coordinates, re-measuring on resize and scroll (capture phase, to catch
 * scrolls in any nested container). Returns `null` when the selector is `null`
 * or matches nothing — the caller renders a centered, target-less popup then.
 *
 * While a match is active it tags the element with {@link HIGHLIGHT_ATTRIBUTE}
 * and removes the tag on cleanup, so hover-only affordances can be forced open.
 */
export const useTargetRect = (selector: string | null): TargetRect | null => {
  const [rect, setRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (selector === null) {
      setRect(null);

      return;
    }

    const element = document.querySelector(selector);

    if (element === null) {
      setRect(null);

      return;
    }

    element.setAttribute(HIGHLIGHT_ATTRIBUTE, 'true');

    const measure = (): void => setRect(toTargetRect(element));

    // Measure now and once more on the next frame, after any layout settling
    // triggered by mounting the overlay (e.g. scrollbars appearing).
    measure();
    const frame = requestAnimationFrame(measure);

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      element.removeAttribute(HIGHLIGHT_ATTRIBUTE);
    };
  }, [selector]);

  return rect;
};
