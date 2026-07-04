import React, { useCallback, useMemo, useState } from 'react';

import { TUTORIAL_STEPS } from './constants/tutorialSteps';
import { TutorialContext } from './TutorialContext';
import { TutorialOverlay } from './components/TutorialOverlay/TutorialOverlay';
import type { TutorialContextValue } from './types/tutorialContext';

/** Sentinel index used while the tour is not running. */
const INACTIVE_INDEX = -1;

type TutorialProviderProps = {
  children: React.ReactNode;
};

/**
 * Owns the tutorial state machine and renders the overlay for the whole app.
 * Wrap the app once; any descendant can drive the tour via `useTutorial`.
 */
export const TutorialProvider = ({
  children,
}: TutorialProviderProps): React.ReactElement => {
  const [stepIndex, setStepIndex] = useState(INACTIVE_INDEX);

  const start = useCallback(() => setStepIndex(0), []);

  const stop = useCallback(() => setStepIndex(INACTIVE_INDEX), []);

  const next = useCallback(() => {
    setStepIndex((current) => {
      if (current === INACTIVE_INDEX) return current;

      const nextIndex = current + 1;

      return nextIndex >= TUTORIAL_STEPS.length ? INACTIVE_INDEX : nextIndex;
    });
  }, []);

  const prev = useCallback(() => {
    setStepIndex((current) => (current <= 0 ? current : current - 1));
  }, []);

  const goToStep = useCallback((index: number) => {
    setStepIndex((current) =>
      index < 0 || index >= TUTORIAL_STEPS.length ? current : index,
    );
  }, []);

  const value = useMemo<TutorialContextValue>(() => {
    const isActive = stepIndex !== INACTIVE_INDEX;

    return {
      isActive,
      currentStep: isActive ? TUTORIAL_STEPS[stepIndex] : null,
      stepIndex,
      stepCount: TUTORIAL_STEPS.length,
      start,
      stop,
      next,
      prev,
      goToStep,
    };
  }, [stepIndex, start, stop, next, prev, goToStep]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialOverlay />
    </TutorialContext.Provider>
  );
};
