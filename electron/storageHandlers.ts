import { app, dialog, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

const getStateFile = (): string => path.join(app.getPath('userData'), 'state.json');
const getSoundsDir = (): string => path.join(app.getPath('userData'), 'sounds');
const getSoundsIndexFile = (): string => path.join(getSoundsDir(), 'index.json');

interface SoundMeta {
  id: string;
  name: string;
  mimeType: string;
  createdAt: number;
}

type StateData = Record<string, unknown>;

/** On-disk format version of a portable `.djsession` file. */
const SESSION_FORMAT_VERSION = 1;

/** App identifier embedded in session files to reject foreign archives. */
const SESSION_APP_ID = 'dj-app-2';

/** File extension (without dot) for portable session archives. */
const SESSION_EXTENSION = 'djsession';

/** Container shape of a portable session archive. */
interface SessionFile {
  formatVersion: number;
  app: string;
  savedAt: number;
  state: StateData;
  sounds: Array<{ meta: SoundMeta; dataBase64: string }>;
}

/** Result of a session save request. */
interface SessionSaveResult {
  saved: boolean;
  path?: string;
}

/** Result of a session load request. */
interface SessionLoadResult {
  loaded: boolean;
  error?: string;
}

// In-memory cache — avoids redundant disk reads and makes concurrent writes safe
// (JS is single-threaded, so all callers share the same object reference).
let stateCache: StateData | null = null;

const readStateFile = async (): Promise<StateData> => {
  if (stateCache !== null) {
    return stateCache;
  }
  try {
    const raw = await fs.readFile(getStateFile(), 'utf-8');
    stateCache = JSON.parse(raw) as StateData;
  } catch {
    stateCache = {};
  }
  return stateCache;
};

const writeStateFile = async (data: StateData): Promise<void> => {
  stateCache = data;
  await fs.writeFile(getStateFile(), JSON.stringify(data), 'utf-8');
};

let indexCache: SoundMeta[] | null = null;

const readSoundsIndex = async (): Promise<SoundMeta[]> => {
  if (indexCache !== null) {
    return indexCache;
  }
  try {
    const raw = await fs.readFile(getSoundsIndexFile(), 'utf-8');
    indexCache = JSON.parse(raw) as SoundMeta[];
  } catch {
    indexCache = [];
  }
  return indexCache;
};

const writeSoundsIndex = async (index: SoundMeta[]): Promise<void> => {
  indexCache = index;
  await fs.mkdir(getSoundsDir(), { recursive: true });
  await fs.writeFile(getSoundsIndexFile(), JSON.stringify(index), 'utf-8');
};

/** Drops the in-memory caches so the next read reflects on-disk changes. */
const invalidateCaches = (): void => {
  stateCache = null;
  indexCache = null;
};

/** Deletes the entire sounds directory (binaries + index). */
const wipeSoundsDir = async (): Promise<void> => {
  await fs.rm(getSoundsDir(), { recursive: true, force: true });
};

/** Reads every stored sound and returns it with base64-encoded bytes. */
const readAllSounds = async (): Promise<SessionFile['sounds']> => {
  const index = await readSoundsIndex();

  const entries = await Promise.all(
    index.map(async (meta) => {
      try {
        const buffer = await fs.readFile(path.join(getSoundsDir(), meta.id));

        return { meta, dataBase64: buffer.toString('base64') };
      } catch {
        return null;
      }
    }),
  );

  return entries.filter((entry): entry is SessionFile['sounds'][number] => entry !== null);
};

/** Replaces all persisted state and sounds with the contents of a session. */
const applySession = async (session: SessionFile): Promise<void> => {
  await writeStateFile(session.state ?? {});

  await wipeSoundsDir();
  await fs.mkdir(getSoundsDir(), { recursive: true });

  const index: SoundMeta[] = [];
  await Promise.all(
    (session.sounds ?? []).map(async (entry) => {
      await fs.writeFile(
        path.join(getSoundsDir(), entry.meta.id),
        Buffer.from(entry.dataBase64, 'base64'),
      );
      index.push(entry.meta);
    }),
  );

  await writeSoundsIndex(index);
};

/** Default file name suggested in the save dialog (`session-YYYY-MM-DD`). */
const defaultSessionFileName = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  return `session-${yyyy}-${mm}-${dd}.${SESSION_EXTENSION}`;
};

export const registerStorageHandlers = (): void => {
  ipcMain.handle('store:get', async (_, key: string): Promise<unknown> => {
    const state = await readStateFile();
    return state[key] ?? null;
  });

  ipcMain.handle('store:set', async (_, key: string, value: unknown): Promise<void> => {
    const state = await readStateFile();
    state[key] = value;
    await writeStateFile(state);
  });

  ipcMain.handle('sounds:list', async (): Promise<SoundMeta[]> => readSoundsIndex());

  ipcMain.handle(
    'sounds:add',
    async (_, meta: Omit<SoundMeta, 'id'>, data: Uint8Array): Promise<SoundMeta> => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await fs.mkdir(getSoundsDir(), { recursive: true });
      await fs.writeFile(path.join(getSoundsDir(), id), Buffer.from(data));
      const record: SoundMeta = { id, ...meta };
      const index = await readSoundsIndex();
      await writeSoundsIndex([...index, record]);
      return record;
    },
  );

  ipcMain.handle(
    'sounds:update',
    async (
      _,
      id: string,
      patch: Partial<Omit<SoundMeta, 'id'>>,
    ): Promise<SoundMeta | null> => {
      const index = await readSoundsIndex();
      let updated: SoundMeta | null = null;
      const next = index.map((entry) => {
        if (entry.id !== id) return entry;
        updated = { ...entry, ...patch };

        return updated;
      });
      if (!updated) return null;
      await writeSoundsIndex(next);

      return updated;
    },
  );

  ipcMain.handle(
    'sounds:replace',
    async (
      _,
      id: string,
      data: Uint8Array,
      patch?: Partial<Omit<SoundMeta, 'id'>>,
    ): Promise<SoundMeta | null> => {
      const index = await readSoundsIndex();
      const existing = index.find((entry) => entry.id === id);
      if (!existing) return null;

      await fs.mkdir(getSoundsDir(), { recursive: true });
      await fs.writeFile(path.join(getSoundsDir(), id), Buffer.from(data));

      const updated: SoundMeta = { ...existing, ...patch };
      const next = index.map((entry) => (entry.id === id ? updated : entry));
      await writeSoundsIndex(next);

      return updated;
    },
  );

  ipcMain.handle('sounds:remove', async (_, id: string): Promise<void> => {
    const index = await readSoundsIndex();
    await writeSoundsIndex(index.filter((entry) => entry.id !== id));
    try {
      await fs.unlink(path.join(getSoundsDir(), id));
    } catch {
      // File may not exist; index is already updated.
    }
  });

  ipcMain.handle('sounds:read', async (_, id: string): Promise<Uint8Array | null> => {
    try {
      const buffer = await fs.readFile(path.join(getSoundsDir(), id));
      return new Uint8Array(buffer);
    } catch {
      return null;
    }
  });

  ipcMain.handle('session:save', async (): Promise<SessionSaveResult> => {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultSessionFileName(),
      filters: [{ name: 'DJ Session', extensions: [SESSION_EXTENSION] }],
    });
    if (result.canceled || !result.filePath) {
      return { saved: false };
    }

    const session: SessionFile = {
      formatVersion: SESSION_FORMAT_VERSION,
      app: SESSION_APP_ID,
      savedAt: Date.now(),
      state: await readStateFile(),
      sounds: await readAllSounds(),
    };
    await fs.writeFile(result.filePath, JSON.stringify(session), 'utf-8');

    return { saved: true, path: result.filePath };
  });

  ipcMain.handle('session:load', async (): Promise<SessionLoadResult> => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'DJ Session', extensions: [SESSION_EXTENSION] }],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { loaded: false };
    }

    try {
      const raw = await fs.readFile(result.filePaths[0], 'utf-8');
      const session = JSON.parse(raw) as SessionFile;
      if (session.app !== SESSION_APP_ID || session.formatVersion !== SESSION_FORMAT_VERSION) {
        return { loaded: false, error: 'incompatible' };
      }

      await applySession(session);

      return { loaded: true };
    } catch {
      return { loaded: false, error: 'invalid' };
    }
  });

  ipcMain.handle('session:new', async (): Promise<void> => {
    await writeStateFile({});
    await wipeSoundsDir();
    await writeSoundsIndex([]);
    invalidateCaches();
  });

  ipcMain.handle(
    'file:save-audio',
    async (_, defaultName: string, data: Uint8Array): Promise<boolean> => {
      const result = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: [{ name: 'Audio', extensions: ['webm'] }],
      });
      if (result.canceled || !result.filePath) {
        return false;
      }

      await fs.writeFile(result.filePath, Buffer.from(data));

      return true;
    },
  );
};

export const unregisterStorageHandlers = (): void => {
  ipcMain.removeHandler('store:get');
  ipcMain.removeHandler('store:set');
  ipcMain.removeHandler('sounds:list');
  ipcMain.removeHandler('sounds:add');
  ipcMain.removeHandler('sounds:update');
  ipcMain.removeHandler('sounds:replace');
  ipcMain.removeHandler('sounds:remove');
  ipcMain.removeHandler('sounds:read');
  ipcMain.removeHandler('session:save');
  ipcMain.removeHandler('session:load');
  ipcMain.removeHandler('session:new');
  ipcMain.removeHandler('file:save-audio');
};
