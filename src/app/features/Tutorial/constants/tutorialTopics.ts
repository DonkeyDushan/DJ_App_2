import { STRINGS } from '../../../strings';
import type { TutorialTopic } from '../types/tutorialStep';

/** A topic tab: the topic key and the label shown on the tab. */
export type TutorialTopicTab = {
  readonly topic: TutorialTopic;
  readonly label: string;
};

/**
 * Ordered topic tabs shown at the top of the popup. Order matches the grouping
 * of {@link TUTORIAL_STEPS}; selecting a tab jumps to that topic's first step.
 *
 * Frozen to prevent accidental mutation of shared reference data.
 */
export const TUTORIAL_TOPICS: readonly TutorialTopicTab[] = Object.freeze([
  { topic: 'mixer', label: STRINGS.tutorial.topics.mixer },
  { topic: 'set', label: STRINGS.tutorial.topics.set },
  { topic: 'session', label: STRINGS.tutorial.topics.session },
]);
