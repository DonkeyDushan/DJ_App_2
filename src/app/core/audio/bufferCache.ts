/**
 * Buffer cache management for demo and custom audio tracks.
 * Handles fetching, decoding, and caching AudioBuffer instances.
 */

import type { CustomSoundRecord } from '../types/mixData';
import type { TrackDefinition } from '../types/trackData';
import { createDemoBuffer } from './synthesis';

/**
 * Loads a preloaded audio file from its URL and decodes it.
 * Returns null if the track has no preloadedSrc or if the fetch fails.
 */
export const fetchAndDecodePreloadedBuffer = async (
  context: AudioContext,
  track: TrackDefinition,
): Promise<AudioBuffer | null> => {
  if (!track.preloadedSrc) {
    return null;
  }

  try {
    const response = await fetch(track.preloadedSrc);
    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();

    return await context.decodeAudioData(arrayBuffer);
  } catch {
    return null;
  }
};

/**
 * Resolves the AudioBuffer for a demo track, using the cache first.
 * Falls back to createDemoBuffer if preloaded audio is unavailable.
 */
export const getDemoBuffer = async (
  context: AudioContext,
  track: TrackDefinition,
  cache: Map<string, AudioBuffer>,
): Promise<AudioBuffer> => {
  const cached = cache.get(track.id);
  if (cached) {
    return cached;
  }

  const preloaded = await fetchAndDecodePreloadedBuffer(context, track);
  if (preloaded) {
    cache.set(track.id, preloaded);

    return preloaded;
  }

  const fallback = createDemoBuffer(context, track.id);
  cache.set(track.id, fallback);

  return fallback;
};

/**
 * Resolves the AudioBuffer for a custom sound, using the cache first.
 * Decodes from the Blob if not cached.
 */
export const getCustomBuffer = async (
  context: AudioContext,
  record: CustomSoundRecord,
  cache: Map<string, AudioBuffer>,
): Promise<AudioBuffer> => {
  const cached = cache.get(record.id);
  if (cached) {
    return cached;
  }

  const buffer = await context.decodeAudioData(
    await record.blob.arrayBuffer(),
  );
  cache.set(record.id, buffer);

  return buffer;
};

/**
 * Resolves the appropriate AudioBuffer for any track type.
 * Returns null if a custom track's sound record cannot be found.
 */
export const resolveTrackBuffer = async (
  context: AudioContext,
  track: TrackDefinition,
  customSounds: CustomSoundRecord[],
  demoCache: Map<string, AudioBuffer>,
  customCache: Map<string, AudioBuffer>,
): Promise<AudioBuffer | null> => {
  if (track.kind === 'demo') {
    return getDemoBuffer(context, track, demoCache);
  }

  const sound = customSounds.find((entry) => entry.id === track.customSoundId);
  if (!sound) {
    return null;
  }

  return getCustomBuffer(context, sound, customCache);
};
