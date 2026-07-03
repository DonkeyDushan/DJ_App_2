import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { TUTORIAL_STEPS } from './constants/tutorialSteps';
import { TutorialOverlay } from './components/TutorialOverlay/TutorialOverlay';
import type { TutorialContextValue } from './types/tutorialContext';

/** Sentinel index used while the tour is not running. */
const INACTIVE_INDEX = -1;

const TutorialContext = createContext<TutorialContextValue | null>(null);

type TutorialProviderProps = {
  children: React.ReactNode;
};

/**
 * Owns the tutorial state machine and renders the overlay for the whole app.
 * Wrap the app once; any descendant can drive the tour via {@link useTutorial}.
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
    setStepIndex((current) =>
      current <= 0 ? current : current - 1,
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
    };
  }, [stepIndex, start, stop, next, prev]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialOverlay />
    </TutorialContext.Provider>
  );
};

/**
 * Access the tutorial controls and progress. Throws if used outside
 * {@link TutorialProvider} so misuse fails loudly during development.
 */
export const useTutorial = (): TutorialContextValue => {
  const context = useContext(TutorialContext);

  if (context === null) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }

  return context;
};
