/**
 * Reactive snapshot of the session dirty flag for UI (e.g. the unsaved-changes
 * indicator and confirm-before-discard prompts).
 */

import { useSyncExternalStore } from 'react';

import {
  getSessionDirtySnapshot,
  subscribeSessionDirty,
} from './sessionDirtyStore';

export const useSessionDirty = (): boolean =>
  useSyncExternalStore(
    subscribeSessionDirty,
    getSessionDirtySnapshot,
    getSessionDirtySnapshot,
  );
