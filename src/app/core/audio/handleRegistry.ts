/**
 * PlaybackHandle registry — tracks active handles per track and emits
 * playback state events to registered listeners.
 */

import type { PlaybackHandle, PlaybackListener, PlaybackState } from './audioTypes';
import { disconnectHandle } from './nodeFactory';

/** Returns the current playback state derived from a handle set. */
export const derivePlaybackState = (
  handles: Set<PlaybackHandle> | undefined,
): PlaybackState => {
  if (!handles || handles.size === 0) {
    return { isPlaying: false, isPreviewPlaying: false };
  }

  const isPreviewPlaying = Array.from(handles).some((h) => h.oneShot);

  return { isPlaying: true, isPreviewPlaying };
};

/** Notifies all listeners with the current state for a given track. */
export const emitPlaybackState = (
  trackId: string,
  activeHandles: Map<string, Set<PlaybackHandle>>,
  listeners: Set<PlaybackListener>,
): void => {
  const state = derivePlaybackState(activeHandles.get(trackId));
  listeners.forEach((listener) => listener(trackId, state));
};

/**
 * Registers a handle into the active map and sets up its onended cleanup.
 * Emits playback state after registration.
 */
export const registerHandle = (
  handle: PlaybackHandle,
  activeHandles: Map<string, Set<PlaybackHandle>>,
  listeners: Set<PlaybackListener>,
): void => {
  const set = activeHandles.get(handle.trackId) ?? new Set<PlaybackHandle>();
  set.add(handle);
  activeHandles.set(handle.trackId, set);
  emitPlaybackState(handle.trackId, activeHandles, listeners);

  handle.source.onended = () => {
    const handles = activeHandles.get(handle.trackId);
    handles?.delete(handle);
    if (handles && handles.size === 0) {
      activeHandles.delete(handle.trackId);
    }
    disconnectHandle(handle);
    emitPlaybackState(handle.trackId, activeHandles, listeners);
  };
};

/**
 * Stops and removes handles matching the predicate, then emits the updated state.
 * If no predicate is supplied, all handles for the track are stopped.
 */
export const stopTrackHandles = (
  trackId: string,
  activeHandles: Map<string, Set<PlaybackHandle>>,
  listeners: Set<PlaybackListener>,
  shouldStop: (handle: PlaybackHandle) => boolean = () => true,
): void => {
  const handles = activeHandles.get(trackId);
  if (!handles) {
    return;
  }

  Array.from(handles).forEach((handle) => {
    if (!shouldStop(handle)) {
      return;
    }

    handles.delete(handle);
    handle.source.onended = null;
    try {
      handle.source.stop();
    } catch {
      // Ignore double-stop races.
    }
    disconnectHandle(handle);
  });

  if (handles.size === 0) {
    activeHandles.delete(trackId);
  }

  emitPlaybackState(trackId, activeHandles, listeners);
};

/** Applies an update function to every active handle for a track. */
export const updateTrackHandles = (
  trackId: string,
  activeHandles: Map<string, Set<PlaybackHandle>>,
  updater: (handle: PlaybackHandle) => void,
): void => {
  const handles = activeHandles.get(trackId);
  if (!handles) {
    return;
  }

  handles.forEach(updater);
};
