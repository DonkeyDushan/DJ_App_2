/**
 * Persistence layer for DJ sessions (set timeline data).
 */

import type { DJSession } from '../types/sessionData';
import { getState, setState } from './appState';

/** Storage key for the saved sessions list. */
const KEY = 'dj-sessions';

export const loadSessions = async (): Promise<DJSession[]> =>
  (await getState<DJSession[]>(KEY)) ?? [];

export const persistSessions = (sessions: DJSession[]): void => {
  setState(KEY, sessions);
};
