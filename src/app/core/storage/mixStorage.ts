/**
 * Persistence layer for saved mixes.
 */

import type { SavedMix } from '../types/mixData';
import { getState, setState } from './appState';

/** Storage key for the saved mixes list. */
const KEY = 'saved-mixes';

export const loadSavedMixes = async (): Promise<SavedMix[]> =>
  (await getState<SavedMix[]>(KEY)) ?? [];

export const persistSavedMixes = (mixes: SavedMix[]): void => {
  setState(KEY, mixes);
};
