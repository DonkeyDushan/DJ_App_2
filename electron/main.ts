import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const SUPPORTED_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a']);

function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, '/');
}

async function getExistingDirectory(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) {
        return candidate;
      }
    } catch {
      // Ignore missing directories and continue with next candidate.
    }
  }

  return null;
}

async function listPreloadedAudioFiles(): Promise<Array<{ fileName: string; src: string }>> {
  const appPath = app.getAppPath();
  const searchDirectories = [
    path.join(process.cwd(), 'public', 'audio', 'preloaded'),
    path.join(process.cwd(), 'dist', 'audio', 'preloaded'),
    path.join(appPath, 'public', 'audio', 'preloaded'),
    path.join(appPath, 'dist', 'audio', 'preloaded'),
  ];

  const directory = await getExistingDirectory(searchDirectories);
  if (!directory) {
    return [];
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && SUPPORTED_AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({
      fileName: entry.name,
      src: normalizeSlashes(`/audio/preloaded/${encodeURIComponent(entry.name)}`),
    }))
    .sort((left, right) => left.fileName.localeCompare(right.fileName));
}

async function createWindow(): Promise<void> {
  const window = new BrowserWindow({
    width: 1580,
    height: 980,
    minWidth: 1280,
    minHeight: 820,
    backgroundColor: '#090812',
    title: 'DJ App 2',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await window.loadURL(process.env.VITE_DEV_SERVER_URL);
    window.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  await window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(async () => {
  ipcMain.handle('preloaded-audio:list', async () => listPreloadedAudioFiles());

  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  ipcMain.removeHandler('preloaded-audio:list');
});
