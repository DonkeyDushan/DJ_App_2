/**
 * Tuning constants for the Web Audio engine.
 * All timing values are in milliseconds unless the name ends in _S (seconds)
 * or _HZ (Hz). Gain values are linear (0–1) unless noted.
 */

/** Duration of master fade in/out in milliseconds. */
export const FADE_MS = 180;

/** Duration of fade-in when starting transport, in milliseconds. */
export const FADE_IN_MS = 220;

/** Time constant for volume smoothing via setTargetAtTime. */
export const VOLUME_TIME_CONSTANT = 0.015;

/** Time constant for rate smoothing via setTargetAtTime. */
export const RATE_TIME_CONSTANT = 0.02;

/** Time constant for EQ gain smoothing via setTargetAtTime. */
export const EQ_TIME_CONSTANT = 0.03;

/** Time constant for effect send smoothing via setTargetAtTime. */
export const EFFECT_TIME_CONSTANT = 0.03;

/** Short lookahead in seconds before scheduling a loop start. */
export const LOOP_START_LOOKAHEAD_S = 0.04;

/** Short lookahead in seconds before scheduling a one-shot start. */
export const ONESHOT_START_LOOKAHEAD_S = 0.02;

/** EQ low-shelf centre frequency in Hz. */
export const EQ_LOW_FREQ_HZ = 220;

/** EQ mid peaking centre frequency in Hz. */
export const EQ_MID_FREQ_HZ = 1200;

/** EQ mid peaking Q factor. */
export const EQ_MID_Q = 0.9;

/** EQ high-shelf centre frequency in Hz. */
export const EQ_HIGH_FREQ_HZ = 4200;

/** Reverb wet mix gain. */
export const REVERB_WET_GAIN = 0.9;

/** Delay time in seconds. */
export const DELAY_TIME_S = 0.28;

/** Delay low-pass filter cutoff frequency in Hz. */
export const DELAY_FILTER_FREQ_HZ = 4200;

/** Delay feedback gain. */
export const DELAY_FEEDBACK_GAIN = 0.34;

/** Delay wet mix gain. */
export const DELAY_WET_GAIN = 0.8;

/** Maximum supported delay time in seconds. */
export const DELAY_MAX_TIME_S = 1.2;
