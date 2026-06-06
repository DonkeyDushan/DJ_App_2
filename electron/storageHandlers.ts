import { app, ipcMain } from 'electron';
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

  ipcMain.handle('sounds:list', async (): Promise<SoundMeta[]> => {
    return readSoundsIndex();
  });

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
};

export const unregisterStorageHandlers = (): void => {
  ipcMain.removeHandler('store:get');
  ipcMain.removeHandler('store:set');
  ipcMain.removeHandler('sounds:list');
  ipcMain.removeHandler('sounds:add');
  ipcMain.removeHandler('sounds:remove');
  ipcMain.removeHandler('sounds:read');
};
