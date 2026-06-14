/**
 * Layout constants for the session timeline component.
 */

/** Pixels allocated per second in the timeline ruler (visual hint only). */
export const PX_PER_SECOND = 0.5;

/**
 * Minimum allowed slot duration in seconds.
 * Prevents collapsing a slot to zero while resizing.
 */
export const MIN_SLOT_DURATION_SECONDS = 5;

/**
 * Colour palette for slot blocks, cycling by mix ID hash.
 */
export const SLOT_COLORS = Object.freeze([
  '#ff4fd8',
  '#40d9ff',
  '#6cff9f',
  '#ff8f4f',
  '#c97bff',
  '#ffdf4f',
]);

/**
 * Minimum width in pixels below which slot action buttons collapse into a menu.
 */
export const ACTIONS_MIN_WIDTH_PX = 80;
