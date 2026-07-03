import { useEffect, useRef } from 'react';

import { useTutorial } from '../TutorialContext';

/**
 * Starts the tour exactly once, the first time `shouldStart` becomes true.
 *
 * Used to auto-launch the tutorial on a fresh, empty session once initial
 * hydration has settled. Guarded with a ref so it never re-triggers if the
 * condition flips back to true later in the session (e.g. the user clears
 * everything by hand) — the auto-start is a one-shot per app load.
 */
export const useTutorialAutoStart = (shouldStart: boolean): void => {
  const { start } = useTutorial();
  const hasAutoStartedRef = useRef(false);

  useEffect(() => {
    if (!shouldStart || hasAutoStartedRef.current) return;

    hasAutoStartedRef.current = true;
    start();
  }, [shouldStart, start]);
};
