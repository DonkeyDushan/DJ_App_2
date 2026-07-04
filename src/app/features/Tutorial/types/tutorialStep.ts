/**
 * Where the instruction popup is anchored relative to the highlighted target.
 * `center` ignores the target and pins the popup to the middle of the viewport
 * (used for intro / outro steps that have no specific element to spotlight).
 */
export type TutorialPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

/**
 * Top-level topic a step belongs to. Steps are grouped by topic so the popup can
 * show tabs that jump straight to the first step of each area.
 */
export type TutorialTopic = 'mixer' | 'set' | 'session';

/**
 * UI stage a step needs the app to enter before it can spotlight its target.
 * The host reacts to the active step's stage and opens the matching surface —
 * `trackEditor` opens the track edit modal, `customSounds` opens the custom
 * sounds dialog. Steps without a stage spotlight elements already on screen.
 */
export type TutorialStage = 'trackEditor' | 'customSounds';

/**
 * A single screen of the guided tour. Steps are pure, serializable descriptors:
 * they carry a CSS selector to locate the element to spotlight (resolved at
 * runtime against the live DOM) plus the copy to show. No React nodes, no
 * closures — the overlay owns all behaviour.
 */
export type TutorialStep = {
  /** Stable identifier for the step (used as React key and for test hooks). */
  readonly key: string;
  /** Topic this step belongs to; drives the popup's topic tabs. */
  readonly topic: TutorialTopic;
  /**
   * CSS selector for the element to spotlight. The first match in the document
   * is used. `null` renders a centered modal with a plain dark backdrop and no
   * cutout — for welcome / closing screens.
   */
  readonly targetSelector: string | null;
  /** Popup heading. Pulled from `STRINGS.tutorial` at definition time. */
  readonly title: string;
  /** Popup body copy. Pulled from `STRINGS.tutorial` at definition time. */
  readonly body: string;
  /** Anchor side for the popup relative to the target. */
  readonly placement: TutorialPlacement;
  /**
   * UI surface the host must open for this step. Omitted for steps whose target
   * is already on screen.
   */
  readonly stage?: TutorialStage;
  /**
   * Extra padding in px added around the target rect for the spotlight cutout.
   * Overrides the default when a target needs more breathing room.
   */
  readonly paddingPx?: number;
};
