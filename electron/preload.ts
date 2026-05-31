import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('djApp', {
  platform: process.platform,
  versions: process.versions,
  listPreloadedAudio: () => ipcRenderer.invoke('preloaded-audio:list') as Promise<Array<{ fileName: string; src: string }>>,
});
