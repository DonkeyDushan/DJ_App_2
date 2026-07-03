/**
 * Transition between two mixes during set playback.
 *
 * - `cut`: near-instant switch (a short click-guard fade only).
 * - `fade`: outgoing mix fades to silence, then the incoming mix fades up —
 *   the two never overlap.
 * - `crossfade`: both mixes play at once; the outgoing fades down while the
 *   incoming fades up over the full transition duration.
 */
export type TransitionKind = 'cut' | 'fade' | 'crossfade';
