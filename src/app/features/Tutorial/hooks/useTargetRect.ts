import { useEffect, useState } from 'react';

import type { TargetRect } from '../types/targetRect';

/**
 * Attribute set on the currently spotlighted element while its step is active.
 * Components can react to it in CSS — e.g. a track card reveals its hover-only
 * action buttons when `[data-tutorial-highlight="true"]`, so the tour can point
 * at controls the user is not physically hovering.
 */
const HIGHLIGHT_ATTRIBUTE = 'data-tutorial-highlight';

/**
 * How long in ms to keep polling for a target that is not in the DOM yet. Dialog
 * steps open their target a few frames later (state update → mount → open
 * animation), so the hook retries until it appears or this budget elapses.
 */
const FIND_TIMEOUT_MS = 1200;

/**
 * How long in ms to keep re-measuring after the target is found, so the rect
 * tracks a dialog/modal as it animates open (~225ms) to its final size.
 */
const SETTLE_DURATION_MS = 360;

/** Interval in ms between re-measures during the settle window. */
const SETTLE_STEP_MS = 60;

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
 * coordinates. Handles targets that mount asynchronously (dialogs opened by the
 * tour) by polling until the element appears, then re-measures across its open
 * animation and on resize/scroll. Returns `null` when the selector is `null` or
 * never resolves — the caller renders a centered, target-less popup then.
 *
 * While a match is active it tags the element with {@link HIGHLIGHT_ATTRIBUTE}
 * and removes the tag on cleanup, so hover-only affordances can be forced open.
 */
export const useTargetRect = (selector: string | null): TargetRect | null => {
  const [rect, setRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (selector === null) {
      setRect(null);

      return undefined;
    }

    let element: Element | null = null;
    let findRaf = 0;
    const settleTimers: number[] = [];

    const measure = (): void => {
      if (element !== null) setRect(toTargetRect(element));
    };

    const attach = (found: Element): void => {
      element = found;
      found.setAttribute(HIGHLIGHT_ATTRIBUTE, 'true');

      // Measure now and repeatedly across the open animation so the spotlight
      // settles onto the element's final position and size.
      measure();
      for (let t = SETTLE_STEP_MS; t <= SETTLE_DURATION_MS; t += SETTLE_STEP_MS) {
        settleTimers.push(window.setTimeout(measure, t));
      }

      window.addEventListener('resize', measure);
      window.addEventListener('scroll', measure, true);
    };

    // Poll for the target: it may mount a few frames after the step activates
    // (dialog steps open their dialog via a state update + open animation).
    const startedAt = performance.now();
    const poll = (): void => {
      const found = document.querySelector(selector);

      if (found !== null) {
        attach(found);

        return;
      }

      if (performance.now() - startedAt > FIND_TIMEOUT_MS) {
        setRect(null);

        return;
      }

      findRaf = requestAnimationFrame(poll);
    };

    setRect(null);
    poll();

    return () => {
      cancelAnimationFrame(findRaf);
      settleTimers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      element?.removeAttribute(HIGHLIGHT_ATTRIBUTE);
    };
  }, [selector]);

  return rect;
};
