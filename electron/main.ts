import { app, BrowserWindow, ipcMain, Menu, protocol } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { registerStorageHandlers, unregisterStorageHandlers } from './storageHandlers';

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const SUPPORTED_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a']);

/**
 * Custom URL scheme used to serve the bundled preloaded audio files.
 * A custom scheme is required because the packaged renderer loads from a
 * `file://` origin, where `fetch('/audio/...')` cannot reach assets packed
 * inside `app.asar`. This scheme is handled in the main process via `fs`,
 * which transparently reads from the asar archive.
 */
const PRELOADED_AUDIO_SCHEME = 'preloadedaudio';

/** Host segment used in preloaded audio URLs (`preloadedaudio://audio/<file>`). */
const PRELOADED_AUDIO_HOST = 'audio';

/** Maps audio file extensions to the MIME type used in protocol responses. */
const AUDIO_MIME_TYPES: Readonly<Record<string, string>> = Object.freeze({
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',
  '.m4a': 'audio/mp4',
});

/** Fallback MIME type for audio files with an unrecognised extension. */
const FALLBACK_MIME_TYPE = 'application/octet-stream';

/** Cached result of {@link resolvePreloadedDirectory}; `undefined` until resolved. */
let cachedPreloadedDirectory: string | null | undefined;

// Privileged scheme registration must run before the app is ready so the
// renderer can `fetch()` preloaded audio over the custom scheme.
protocol.registerSchemesAsPrivileged([
  {
    scheme: PRELOADED_AUDIO_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

function resolveAudioMimeType(fileName: string): string {
  return AUDIO_MIME_TYPES[path.extname(fileName).toLowerCase()] ?? FALLBACK_MIME_TYPE;
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

async function resolvePreloadedDirectory(): Promise<string | null> {
  if (cachedPreloadedDirectory !== undefined) {
    return cachedPreloadedDirectory;
  }

  const appPath = app.getAppPath();
  const searchDirectories = [
    path.join(process.cwd(), 'public', 'audio', 'preloaded'),
    path.join(process.cwd(), 'dist', 'audio', 'preloaded'),
    path.join(appPath, 'public', 'audio', 'preloaded'),
    path.join(appPath, 'dist', 'audio', 'preloaded'),
  ];

  cachedPreloadedDirectory = await getExistingDirectory(searchDirectories);

  return cachedPreloadedDirectory;
}

async function listPreloadedAudioFiles(): Promise<Array<{ fileName: string; src: string }>> {
  const directory = await resolvePreloadedDirectory();
  if (!directory) {
    return [];
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && SUPPORTED_AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({
      fileName: entry.name,
      src: `${PRELOADED_AUDIO_SCHEME}://${PRELOADED_AUDIO_HOST}/${encodeURIComponent(entry.name)}`,
    }))
    .sort((left, right) => left.fileName.localeCompare(right.fileName));
}

/**
 * Resolves a preloaded audio request to a file response, reading the bytes via
 * `fs` so the assets remain accessible even when packed inside `app.asar`.
 * Guards against path traversal by rejecting any segment that is not a bare
 * file name within the resolved preloaded directory.
 */
async function handlePreloadedAudioRequest(request: Request): Promise<Response> {
  const fileName = decodeURIComponent(new URL(request.url).pathname.replace(/^\/+/, ''));

  if (!fileName || fileName.includes('/') || fileName.includes('\\') || fileName.includes('..')) {
    return new Response(null, { status: 400 });
  }

  const directory = await resolvePreloadedDirectory();
  if (!directory) {
    return new Response(null, { status: 404 });
  }

  try {
    const data = await fs.readFile(path.join(directory, fileName));

    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': resolveAudioMimeType(fileName),
        'Content-Length': String(data.byteLength),
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
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
  // The default application menu (File / Edit / View / Window / Help) is
  // meaningless for this app, so remove it entirely on Windows and Linux.
  Menu.setApplicationMenu(null);

  registerStorageHandlers();
  protocol.handle(PRELOADED_AUDIO_SCHEME, handlePreloadedAudioRequest);
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
  unregisterStorageHandlers();
  ipcMain.removeHandler('preloaded-audio:list');
  protocol.unhandle(PRELOADED_AUDIO_SCHEME);
});
