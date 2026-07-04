import { STRINGS } from '../../../strings';
import type { TutorialStep } from '../types/tutorialStep';

/**
 * Selector for the demo track card the tour spotlights. The track grid tags one
 * stable card (the first in display order) with `data-tutorial-track`, so the
 * tour always points at the same, on-screen track regardless of virtualization.
 */
const DEMO_TRACK_SELECTOR = '[data-tutorial-track="true"]';

/**
 * MUI puts the `data-testid` on the Dialog root, which is a full-viewport
 * container. Spotlighting that would cover the whole screen, so target the inner
 * paper (the actual dialog box) instead.
 */
const TRACK_EDITOR_SELECTOR = '[data-testid="track-edit-modal"] .MuiDialog-paper';
const CUSTOM_SOUNDS_SELECTOR =
  '[data-testid="custom-sounds-dialog"] .MuiDialog-paper';

/**
 * Ordered screens of the guided tour. Adding a step is a single entry here; the
 * overlay and progress counter derive everything from this array.
 *
 * Steps carrying a `stage` require the host to open a UI surface (edit modal,
 * custom sounds dialog) before their target exists in the DOM.
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
    key: 'mixer',
    targetSelector: '[data-testid="mixer-panel"]',
    title: STRINGS.tutorial.mixer.title,
    body: STRINGS.tutorial.mixer.body,
    placement: 'bottom',
  },
  {
    key: 'track',
    targetSelector: DEMO_TRACK_SELECTOR,
    title: STRINGS.tutorial.track.title,
    body: STRINGS.tutorial.track.body,
    placement: 'right',
  },
  {
    key: 'track-editor',
    targetSelector: TRACK_EDITOR_SELECTOR,
    title: STRINGS.tutorial.trackEditor.title,
    body: STRINGS.tutorial.trackEditor.body,
    placement: 'bottom',
    stage: 'trackEditor',
  },
  {
    key: 'custom-sounds-button',
    targetSelector: '[data-testid="mixer-custom-sounds"]',
    title: STRINGS.tutorial.customSoundsButton.title,
    body: STRINGS.tutorial.customSoundsButton.body,
    placement: 'bottom',
  },
  {
    key: 'custom-sounds',
    targetSelector: CUSTOM_SOUNDS_SELECTOR,
    title: STRINGS.tutorial.customSounds.title,
    body: STRINGS.tutorial.customSounds.body,
    placement: 'bottom',
    stage: 'customSounds',
  },
  {
    key: 'check-tracks',
    targetSelector: DEMO_TRACK_SELECTOR,
    title: STRINGS.tutorial.checkTracks.title,
    body: STRINGS.tutorial.checkTracks.body,
    placement: 'right',
  },
  {
    key: 'play-mix',
    targetSelector: '[data-testid="mixer-play"]',
    title: STRINGS.tutorial.playMix.title,
    body: STRINGS.tutorial.playMix.body,
    placement: 'bottom',
  },
  {
    key: 'global-tempo',
    targetSelector: '[data-testid="mixer-tempo"]',
    title: STRINGS.tutorial.globalTempo.title,
    body: STRINGS.tutorial.globalTempo.body,
    placement: 'bottom',
  },
  {
    key: 'save-mix',
    targetSelector: '[data-testid="mixer-save-group"]',
    title: STRINGS.tutorial.saveMix.title,
    body: STRINGS.tutorial.saveMix.body,
    placement: 'bottom',
  },
  {
    key: 'mix-library',
    targetSelector: '[data-testid="mix-library"]',
    title: STRINGS.tutorial.mixLibrary.title,
    body: STRINGS.tutorial.mixLibrary.body,
    placement: 'right',
  },
]);
