/// <reference types="vite/client" />

interface SoundMeta {
  id: string;
  name: string;
  mimeType: string;
  createdAt: number;
}

interface Window {
  djApp?: {
    platform: NodeJS.Platform;
    versions: NodeJS.ProcessVersions;
    listPreloadedAudio?: () => Promise<Array<{ fileName: string; src: string }>>;
    store?: {
      get: (key: string) => Promise<unknown>;
      set: (key: string, value: unknown) => Promise<void>;
    };
    sounds?: {
      list: () => Promise<SoundMeta[]>;
      add: (meta: Omit<SoundMeta, 'id'>, data: Uint8Array) => Promise<SoundMeta>;
      remove: (id: string) => Promise<void>;
      read: (id: string) => Promise<Uint8Array | null>;
    };
  };
}
