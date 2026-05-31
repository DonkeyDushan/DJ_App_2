import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('djApp', {
  platform: process.platform,
  versions: process.versions,
});