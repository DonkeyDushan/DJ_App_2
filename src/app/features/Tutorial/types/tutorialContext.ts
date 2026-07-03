import type { TutorialStep } from './tutorialStep';

/**
 * Public API of the tutorial state machine, exposed through {@link useTutorial}.
 * Consumers start the tour and read progress; all navigation side effects
 * (keyboard, rect measurement, spotlight) live inside the feature.
 */
export type TutorialContextValue = {
  /** Whether the tour is currently running. */
  readonly isActive: boolean;
  /** The step being shown, or `null` while inactive. */
  readonly currentStep: TutorialStep | null;
  /** Zero-based index of the current step (`-1` while inactive). */
  readonly stepIndex: number;
  /** Total number of steps in the tour. */
  readonly stepCount: number;
  /** Begin the tour from the first step. */
  readonly start: () => void;
  /** End the tour and clear the overlay. */
  readonly stop: () => void;
  /** Advance to the next step; ends the tour after the last step. */
  readonly next: () => void;
  /** Return to the previous step; no-op on the first step. */
  readonly prev: () => void;
};
