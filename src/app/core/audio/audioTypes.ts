/**
 * Internal type definitions for the audio engine playback layer.
 */

/** Holds all Web Audio nodes and metadata for a single active playback instance. */
export type PlaybackHandle = {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  eqLowNode: BiquadFilterNode;
  eqMidNode: BiquadFilterNode;
  eqHighNode: BiquadFilterNode;
  reverbSendNode: GainNode;
  delaySendNode: GainNode;
  trackId: string;
  oneShot: boolean;
};

/** Snapshot of whether a track is playing and/or being previewed. */
export type PlaybackState = {
  isPlaying: boolean;
  isPreviewPlaying: boolean;
};

/** Callback invoked by the engine whenever a track's playback state changes. */
export type PlaybackListener = (trackId: string, playbackState: PlaybackState) => void;
