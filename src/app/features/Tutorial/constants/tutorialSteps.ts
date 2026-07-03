import { STRINGS } from '../../../strings';
import type { TutorialStep } from '../types/tutorialStep';

/**
 * Selector matching any mixer track card. The overlay spotlights the first match
 * in document order, so the top-left track is highlighted as a representative
 * example of the whole grid.
 */
const FIRST_TRACK_SELECTOR = '[data-testid^="track-card--"]';

/**
 * Ordered screens of the guided tour. Adding a step is a single entry here; the
 * overlay and progress counter derive everything from this array.
 *
 * Frozen to prevent accidental mutation of shared reference data.
 */
export const TUTORIAL_STEPS: readonly TutorialStep[] = Object.freeze([
  {
    key: 'intro',
    targetSelector: null,
    title: STRINGS.tutorial.intro.title,
    body: STRINGS.tutorial.intro.body,
    placement: 'center',
  },
  {
    key: 'mix-library',
    targetSelector: '[data-testid="mix-library"]',
    title: STRINGS.tutorial.mixLibrary.title,
    body: STRINGS.tutorial.mixLibrary.body,
    placement: 'right',
  },
  {
    key: 'track',
    targetSelector: FIRST_TRACK_SELECTOR,
    title: STRINGS.tutorial.track.title,
    body: STRINGS.tutorial.track.body,
    placement: 'right',
  },
  {
    key: 'track-grid',
    targetSelector: '[data-testid="track-grid"]',
    title: STRINGS.tutorial.trackGrid.title,
    body: STRINGS.tutorial.trackGrid.body,
    placement: 'top',
  },
  {
    key: 'set-section',
    targetSelector: '[data-testid="set-section"]',
    title: STRINGS.tutorial.setSection.title,
    body: STRINGS.tutorial.setSection.body,
    placement: 'top',
  },
  {
    key: 'session',
    targetSelector: '[data-testid="session-save"]',
    title: STRINGS.tutorial.session.title,
    body: STRINGS.tutorial.session.body,
    placement: 'bottom',
  },
  {
    key: 'outro',
    targetSelector: null,
    title: STRINGS.tutorial.outro.title,
    body: STRINGS.tutorial.outro.body,
    placement: 'center',
  },
]);
