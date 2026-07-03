/**
 * Default track definitions and factory functions for building track lists.
 * The DEFAULT_TRACKS are the built-in demo tracks shipped with the app.
 */

import type {
  PreloadedAudioFile,
  TrackCategory,
  TrackDefinition,
  TrackState,
} from '../types/trackData';

/** Base BPM used when normalising playback rate to a tempo multiplier. */
export const BASE_BPM = 120;

/** Default global tempo multiplier (1.0 = 120 BPM at BASE_BPM). */
export const DEFAULT_GLOBAL_TEMPO = 1;

export const detectCategory = (name: string): TrackCategory => {
  const lower = name.toLowerCase();
  if (/drum|kick|snare|hat|perc|conga/.test(lower)) return 'drums';
  if (/bass/.test(lower)) return 'bass';
  if (/key/.test(lower)) return 'keys';
  if (/arp|synth|mel|lead|seq|funk/.test(lower)) return 'arp';
  if (/pad|atm|amb|string|choir/.test(lower)) return 'pad';

  return 'other';
};

export const DEFAULT_TRACKS: TrackDefinition[] = [
  {
    id: 'drums',
    name: 'DRUMS',
    kind: 'demo',
    category: 'drums',
    loopLengthSeconds: 8,
    preloadedSrc: 'audio/preloaded/drums.wav',
  },
  {
    id: 'bass',
    name: 'BASS',
    kind: 'demo',
    category: 'bass',
    loopLengthSeconds: 8,
    preloadedSrc: 'audio/preloaded/bass.wav',
  },
  {
    id: 'keys',
    name: 'KEYS',
    kind: 'demo',
    category: 'keys',
    loopLengthSeconds: 8,
    preloadedSrc: 'audio/preloaded/keys.wav',
  },
  {
    id: 'arp',
    name: 'ARP',
    kind: 'demo',
    category: 'arp',
    loopLengthSeconds: 8,
    preloadedSrc: 'audio/preloaded/arp.wav',
  },
  {
    id: 'pad',
    name: 'PAD',
    kind: 'demo',
    category: 'pad',
    loopLengthSeconds: 8,
    preloadedSrc: 'audio/preloaded/pad.wav',
  },
];

const normalizeFileName = (fileName: string): string =>
  fileName.replace(/\.[^.]+$/, '');

const createStableTrackId = (fileName: string, index: number): string => {
  const normalized = normalizeFileName(fileName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized ? `preloaded-${normalized}` : `preloaded-track-${index}`;
};

export const createPreloadedTrackDefinitions = (
  files: PreloadedAudioFile[],
): TrackDefinition[] =>
  files.map((file, index) => {
    const displayName = normalizeFileName(file.fileName).toUpperCase();

    return {
      id: createStableTrackId(file.fileName, index),
      name: displayName,
      kind: 'demo',
      category: detectCategory(file.fileName),
      loopLengthSeconds: 8,
      preloadedSrc: file.src,
    };
  });

export const createDefaultTrackState = (): Record<string, TrackState> =>
  Object.fromEntries(
    DEFAULT_TRACKS.map((track) => [
      track.id,
      {
        enabled: false,
        volume: 0.78,
        speed: 1,
        followsGlobalTempo: true,
        eqLow: 0,
        eqMid: 0,
        eqHigh: 0,
        reverbSend: 0,
        delaySend: 0,
        isPlaying: false,
        isPreviewPlaying: false,
      },
    ]),
  );

export const createCustomTrackDefinition = (
  id: string,
  name: string,
  loopLengthSeconds: number,
): TrackDefinition => ({
  id,
  name,
  kind: 'custom',
  category: 'custom',
  loopLengthSeconds,
  customSoundId: id,
});
