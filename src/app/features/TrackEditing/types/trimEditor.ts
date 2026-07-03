/**
 * View-model types for the sound trim editor hooks.
 */

/** Result of decoding a custom sound's Blob for the trim editor. */
export interface DecodedSound {
  /** Audio context that owns the decoded buffer and preview playback. */
  context: AudioContext | null;
  /** The decoded buffer, or null while loading or on failure. */
  buffer: AudioBuffer | null;
  /** Total duration of the decoded buffer, in seconds. */
  duration: number;
  /** Normalised absolute-peak buckets (0..1) for waveform rendering. */
  peaks: Float32Array;
  /** True while decoding is in progress. */
  isLoading: boolean;
}

/** Selection state and clamped setters for the kept region. */
export interface TrimSelection {
  /** Start of the kept region, in seconds. */
  startSeconds: number;
  /** End of the kept region, in seconds. */
  endSeconds: number;
  /** Sets the start, clamped to [0, end - min selection]. */
  setStart: (seconds: number) => void;
  /** Sets the end, clamped to [start + min selection, duration]. */
  setEnd: (seconds: number) => void;
}

/** Preview playback controls for the selected region. */
export interface TrimPreview {
  /** True while the selected region is playing. */
  isPlaying: boolean;
  /** Starts the selection if stopped, stops it if playing. */
  toggle: () => void;
  /** Stops preview playback if active. */
  stop: () => void;
}
