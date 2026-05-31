import localforage from 'localforage';

import type { CustomSoundRecord } from '../types';

const storage = localforage.createInstance({
  name: 'dj-app-2',
  storeName: 'custom-sounds',
});

const STORAGE_KEY = 'custom-sounds-index';

export async function loadCustomSounds(): Promise<CustomSoundRecord[]> {
  return (await storage.getItem<CustomSoundRecord[]>(STORAGE_KEY)) ?? [];
}

export async function persistCustomSounds(records: CustomSoundRecord[]): Promise<void> {
  await storage.setItem(STORAGE_KEY, records);
}

export async function addCustomSound(file: File): Promise<CustomSoundRecord> {
  const record: CustomSoundRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name.replace(/\.[^.]+$/, ''),
    mimeType: file.type || 'application/octet-stream',
    blob: file,
    createdAt: Date.now(),
  };

  const current = await loadCustomSounds();
  await persistCustomSounds([...current, record]);
  return record;
}

export async function removeCustomSound(soundId: string): Promise<void> {
  const current = await loadCustomSounds();
  await persistCustomSounds(current.filter((sound) => sound.id !== soundId));
}