import { contextBridge, ipcRenderer } from 'electron';

interface SoundMeta {
  id: string;
  name: string;
  mimeType: string;
  createdAt: number;
}

contextBridge.exposeInMainWorld('djApp', {
  platform: process.platform,
  versions: process.versions,
  listPreloadedAudio: (): Promise<Array<{ fileName: string; src: string }>> =>
    ipcRenderer.invoke('preloaded-audio:list'),
  store: {
    get: (key: string): Promise<unknown> => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown): Promise<void> =>
      ipcRenderer.invoke('store:set', key, value),
  },
  sounds: {
    list: (): Promise<SoundMeta[]> => ipcRenderer.invoke('sounds:list'),
    add: (meta: Omit<SoundMeta, 'id'>, data: Uint8Array): Promise<SoundMeta> =>
      ipcRenderer.invoke('sounds:add', meta, data),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('sounds:remove', id),
    read: (id: string): Promise<Uint8Array | null> => ipcRenderer.invoke('sounds:read', id),
  },
});
