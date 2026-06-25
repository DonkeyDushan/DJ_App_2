/**
 * Layout and sampling constants for the sound trim waveform editor.
 */

/** Rendered width of the trim waveform, in pixels. */
export const WAVEFORM_WIDTH_PX = 520;

/** Rendered height of the trim waveform, in pixels. */
export const WAVEFORM_HEIGHT_PX = 120;

/**
 * Number of peak buckets sampled from the decoded buffer. Kept equal to the
 * waveform pixel width so each bucket maps to one column with no gaps or
 * sub-pixel aliasing.
 */
export const WAVEFORM_PEAK_COUNT = WAVEFORM_WIDTH_PX;

/** Width of each draggable start/end selection handle, in pixels. */
export const SELECTION_HANDLE_WIDTH_PX = 12;

/**
 * Minimum retained selection length, in seconds. Prevents a user from
 * collapsing the selection to zero and exporting an empty sound.
 */
export const MIN_SELECTION_SECONDS = 0.05;
