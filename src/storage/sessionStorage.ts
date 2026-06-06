import type { DJSession } from '../types';
import { getState, setState } from './appState';

const KEY = 'dj-sessions';

export const loadSessions = async (): Promise<DJSession[]> =>
  (await getState<DJSession[]>(KEY)) ?? [];

export const persistSessions = (sessions: DJSession[]): void => {
  setState(KEY, sessions);
};
