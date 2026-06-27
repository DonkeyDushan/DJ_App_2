/**
 * Module-singleton store tracking whether the working session has unsaved
 * changes relative to the last save/load of a `.djsession` file.
 *
 * The app auto-persists every mutation to disk continuously (document model),
 * so "dirty" here means "changed since the last explicit file save/load" — not
 * "unsaved to disk". Persistence choke points (storage `setState` and custom
 * sound mutations) call `markDirty`; session save/load/new call `clear`.
 *
 * Designed for `useSyncExternalStore` (see CLAUDE.md §6): a subscriber set with
 * ref-counted notification and a synchronous snapshot getter.
 */

let dirty = false;

/**
 * Until activated, `markDirty` is a no-op. This suppresses the hydration writes
 * that fire while the app loads persisted state on mount, which would otherwise
 * mark a freshly opened session as dirty.
 */
let active = false;

const subscribers = new Set<() => void>();

const notify = (): void => {
  subscribers.forEach((callback) => callback());
};

export const subscribeSessionDirty = (callback: () => void): (() => void) => {
  subscribers.add(callback);

  return () => {
    subscribers.delete(callback);
  };
};

export const getSessionDirtySnapshot = (): boolean => dirty;

export const markSessionDirty = (): void => {
  if (!active || dirty) {
    return;
  }

  dirty = true;
  notify();
};

export const clearSessionDirty = (): void => {
  if (!dirty) {
    return;
  }

  dirty = false;
  notify();
};

/** Enables `markDirty` after initial hydration has settled. */
export const activateSessionDirty = (): void => {
  active = true;
};
