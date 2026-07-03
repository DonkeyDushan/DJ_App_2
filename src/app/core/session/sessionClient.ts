/**
 * Thin renderer-side wrappers over the Electron session IPC. The main process
 * owns `state.json` and the sounds directory, so it assembles and applies the
 * portable `.djsession` archive — these wrappers only trigger the dialogs and
 * relay the result.
 */

import { clearSessionDirty } from './sessionDirtyStore';

const session = () => window.djApp?.session;

export type SessionLoadOutcome = {
  loaded: boolean;
  error?: string;
};

/**
 * Opens the native save dialog and writes the current session to a file.
 * Returns `true` when a file was written (clearing the dirty flag), `false`
 * when the user cancelled.
 */
export const saveSessionToFile = async (): Promise<boolean> => {
  const api = session();
  if (!api) {
    return false;
  }

  const result = await api.save();
  if (result.saved) {
    clearSessionDirty();
  }

  return result.saved;
};

/**
 * Opens the native open dialog and replaces all persisted state with the chosen
 * session file. The caller is responsible for reloading the renderer so the
 * fresh state is rehydrated.
 */
export const loadSessionFromFile = async (): Promise<SessionLoadOutcome> => {
  const api = session();
  if (!api) {
    return { loaded: false };
  }

  return api.load();
};

/**
 * Clears all persisted state (mixes, sets, presets, custom sounds, active
 * state) back to defaults. The caller is responsible for reloading the renderer.
 */
export const startNewSession = async (): Promise<void> => {
  const api = session();
  if (!api) {
    return;
  }

  await api.new();
};
