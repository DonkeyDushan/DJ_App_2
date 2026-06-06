import type { SavedMix } from '../types';
import { getState, setState } from './appState';

const KEY = 'saved-mixes';

export const loadSavedMixes = async (): Promise<SavedMix[]> =>
  (await getState<SavedMix[]>(KEY)) ?? [];

export const persistSavedMixes = (mixes: SavedMix[]): void => {
  setState(KEY, mixes);
};
