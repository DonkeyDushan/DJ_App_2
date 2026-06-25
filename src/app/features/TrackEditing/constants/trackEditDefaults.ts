/**
 * Factory-default values for the editable track parameters in the
 * TrackEditModal. Used by the "reset to defaults" action to return every
 * slider to its neutral position regardless of the values the modal was
 * opened with. Kept local to this feature so the editor does not depend on
 * another feature's track-initialisation constants.
 */

/** Default volume level (0–1) — matches a newly created track's audible baseline. */
export const DEFAULT_TRACK_VOLUME = 0.78;

/** Default playback speed multiplier (1.0 = original speed). */
export const DEFAULT_TRACK_SPEED = 1;

/** Default EQ band gain — neutral, no boost or cut. */
export const DEFAULT_TRACK_EQ = 0;

/** Default FX send level — fully dry, no reverb or delay. */
export const DEFAULT_TRACK_FX_SEND = 0;
