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
 * Add-to-set button on a saved mix card. Per-card, so it only resolves when at
 * least one mix exists; otherwise the step degrades to a centered popup.
 */
const ADD_TO_SET_SELECTOR = '[data-testid^="mix-add-to-timeline--"]';

/**
 * Ordered screens of the guided tour, grouped by topic. Adding a step is a
 * single entry here; the overlay, progress counter and topic tabs derive
 * everything from this array.
 *
 * Steps carrying a `stage` require the host to open a UI surface (edit modal,
 * custom sounds dialog) before their target exists in the DOM.
 *
 * Frozen to prevent accidental mutation of shared reference data.
 */
export const TUTORIAL_STEPS: readonly TutorialStep[] = Object.freeze([
  // ── Mixer ────────────────────────────────────────────────────────────────
  {
    key: 'intro',
    topic: 'mixer',
    targetSelector: null,
    title: STRINGS.tutorial.intro.title,
    body: STRINGS.tutorial.intro.body,
    placement: 'center',
  },
  {
    key: 'mixer',
    topic: 'mixer',
    targetSelector: '[data-testid="mixer-panel"]',
    title: STRINGS.tutorial.mixer.title,
    body: STRINGS.tutorial.mixer.body,
    placement: 'bottom',
  },
  {
    key: 'track',
    topic: 'mixer',
    targetSelector: DEMO_TRACK_SELECTOR,
    title: STRINGS.tutorial.track.title,
    body: STRINGS.tutorial.track.body,
    placement: 'right',
  },
  {
    key: 'track-editor',
    topic: 'mixer',
    targetSelector: TRACK_EDITOR_SELECTOR,
    title: STRINGS.tutorial.trackEditor.title,
    body: STRINGS.tutorial.trackEditor.body,
    placement: 'bottom',
    stage: 'trackEditor',
  },
  {
    key: 'custom-sounds-button',
    topic: 'mixer',
    targetSelector: '[data-testid="mixer-custom-sounds"]',
    title: STRINGS.tutorial.customSoundsButton.title,
    body: STRINGS.tutorial.customSoundsButton.body,
    placement: 'bottom',
  },
  {
    key: 'custom-sounds',
    topic: 'mixer',
    targetSelector: CUSTOM_SOUNDS_SELECTOR,
    title: STRINGS.tutorial.customSounds.title,
    body: STRINGS.tutorial.customSounds.body,
    placement: 'bottom',
    stage: 'customSounds',
  },
  {
    key: 'check-tracks',
    topic: 'mixer',
    targetSelector: DEMO_TRACK_SELECTOR,
    title: STRINGS.tutorial.checkTracks.title,
    body: STRINGS.tutorial.checkTracks.body,
    placement: 'right',
  },
  {
    key: 'play-mix',
    topic: 'mixer',
    targetSelector: '[data-testid="mixer-play"]',
    title: STRINGS.tutorial.playMix.title,
    body: STRINGS.tutorial.playMix.body,
    placement: 'bottom',
  },
  {
    key: 'global-tempo',
    topic: 'mixer',
    targetSelector: '[data-testid="mixer-tempo"]',
    title: STRINGS.tutorial.globalTempo.title,
    body: STRINGS.tutorial.globalTempo.body,
    placement: 'bottom',
  },
  {
    key: 'save-mix',
    topic: 'mixer',
    targetSelector: '[data-testid="mixer-save-group"]',
    title: STRINGS.tutorial.saveMix.title,
    body: STRINGS.tutorial.saveMix.body,
    placement: 'bottom',
  },
  {
    key: 'mix-library',
    topic: 'mixer',
    targetSelector: '[data-testid="mix-library"]',
    title: STRINGS.tutorial.mixLibrary.title,
    body: STRINGS.tutorial.mixLibrary.body,
    placement: 'right',
  },
  // ── Set ──────────────────────────────────────────────────────────────────
  {
    key: 'new-mix',
    topic: 'set',
    targetSelector: '[data-testid="mix-new-button"]',
    title: STRINGS.tutorial.newMix.title,
    body: STRINGS.tutorial.newMix.body,
    placement: 'right',
  },
  {
    key: 'add-to-set',
    topic: 'set',
    targetSelector: ADD_TO_SET_SELECTOR,
    title: STRINGS.tutorial.addToSet.title,
    body: STRINGS.tutorial.addToSet.body,
    placement: 'right',
  },
  {
    key: 'set-editor',
    topic: 'set',
    targetSelector: '[data-testid="set-section"]',
    title: STRINGS.tutorial.setEditor.title,
    body: STRINGS.tutorial.setEditor.body,
    placement: 'top',
  },
  {
    key: 'set-library',
    topic: 'set',
    targetSelector: '[data-testid="set-library"]',
    title: STRINGS.tutorial.setLibrary.title,
    body: STRINGS.tutorial.setLibrary.body,
    placement: 'top',
  },
  {
    key: 'set-timeline',
    topic: 'set',
    targetSelector: '[data-testid="set-timeline"]',
    title: STRINGS.tutorial.setTimeline.title,
    body: STRINGS.tutorial.setTimeline.body,
    placement: 'top',
  },
  {
    key: 'play-set',
    topic: 'set',
    targetSelector: '[data-testid="set-play"]',
    title: STRINGS.tutorial.playSet.title,
    body: STRINGS.tutorial.playSet.body,
    placement: 'top',
  },
  {
    key: 'set-name',
    topic: 'set',
    targetSelector: '[data-testid="set-name"]',
    title: STRINGS.tutorial.setName.title,
    body: STRINGS.tutorial.setName.body,
    placement: 'top',
  },
  {
    key: 'set-default-transition',
    topic: 'set',
    targetSelector: '[data-testid="set-default-transition"]',
    title: STRINGS.tutorial.setDefaultTransition.title,
    body: STRINGS.tutorial.setDefaultTransition.body,
    placement: 'top',
  },
  {
    key: 'set-duration',
    topic: 'set',
    targetSelector: '[data-testid="set-duration"]',
    title: STRINGS.tutorial.setDuration.title,
    body: STRINGS.tutorial.setDuration.body,
    placement: 'top',
  },
  {
    key: 'set-reset',
    topic: 'set',
    targetSelector: '[data-testid="set-reset"]',
    title: STRINGS.tutorial.setReset.title,
    body: STRINGS.tutorial.setReset.body,
    placement: 'top',
  },
  {
    key: 'set-save',
    topic: 'set',
    targetSelector: '[data-testid="set-save"]',
    title: STRINGS.tutorial.setSave.title,
    body: STRINGS.tutorial.setSave.body,
    placement: 'top',
  },
  {
    key: 'set-export',
    topic: 'set',
    targetSelector: '[data-testid="set-export"]',
    title: STRINGS.tutorial.setExport.title,
    body: STRINGS.tutorial.setExport.body,
    placement: 'top',
  },
  {
    key: 'new-set',
    topic: 'set',
    targetSelector: '[data-testid="set-new-button"]',
    title: STRINGS.tutorial.newSet.title,
    body: STRINGS.tutorial.newSet.body,
    placement: 'top',
  },
  // ── Session ──────────────────────────────────────────────────────────────
  {
    key: 'session',
    topic: 'session',
    targetSelector: '[data-testid="top-bar"]',
    title: STRINGS.tutorial.session.title,
    body: STRINGS.tutorial.session.body,
    placement: 'bottom',
  },
  {
    key: 'session-save',
    topic: 'session',
    targetSelector: '[data-testid="session-save"]',
    title: STRINGS.tutorial.sessionSave.title,
    body: STRINGS.tutorial.sessionSave.body,
    placement: 'bottom',
  },
  {
    key: 'session-load',
    topic: 'session',
    targetSelector: '[data-testid="session-load"]',
    title: STRINGS.tutorial.sessionLoad.title,
    body: STRINGS.tutorial.sessionLoad.body,
    placement: 'bottom',
  },
  {
    key: 'session-new',
    topic: 'session',
    targetSelector: '[data-testid="session-new"]',
    title: STRINGS.tutorial.sessionNew.title,
    body: STRINGS.tutorial.sessionNew.body,
    placement: 'bottom',
  },
]);
