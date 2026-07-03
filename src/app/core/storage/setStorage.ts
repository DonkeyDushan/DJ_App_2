/**
 * Persistence layer for DJ sets (set timeline data).
 */

import type { DJSet } from '../types/setData';
import { getState, setState } from './appState';

/** Storage key for the saved sets list. */
const KEY = 'dj-sessions';

export const loadSets = async (): Promise<DJSet[]> =>
  (await getState<DJSet[]>(KEY)) ?? [];

export const persistSets = (sets: DJSet[]): void => {
  setState(KEY, sets);
};
