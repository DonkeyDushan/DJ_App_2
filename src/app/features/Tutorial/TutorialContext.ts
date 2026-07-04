import { createContext, useContext } from 'react';

import type { TutorialContextValue } from './types/tutorialContext';

/**
 * React context carrying the tutorial state machine. Kept in its own module
 * (separate from the provider) so the overlay and hooks can consume it without
 * importing the provider, avoiding an import cycle.
 */
export const TutorialContext = createContext<TutorialContextValue | null>(null);

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
