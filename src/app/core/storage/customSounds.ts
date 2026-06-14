/**
 * Persistence layer for user-uploaded custom sound files.
 * Reads/writes via the Electron IPC sounds API.
 */

import type { CustomSoundRecord } from '../types/mixData';

const sounds = () => window.djApp!.sounds!;

export const loadCustomSounds = async (): Promise<CustomSoundRecord[]> => {
  const index = await sounds().list();

  const records = await Promise.all(
    index.map(async (meta) => {
      const data = await sounds().read(meta.id);
      if (!data || data.byteLength === 0) {
        console.warn(`[storage] Sound "${meta.name}" (${meta.id}) is missing or empty — skipping.`);

        return null;
      }
      const blob = new Blob([data.buffer as ArrayBuffer], { type: meta.mimeType });

      return { ...meta, blob } satisfies CustomSoundRecord;
    }),
  );

  return records.filter((r): r is CustomSoundRecord => r !== null);
};

export const addCustomSound = async (file: File): Promise<CustomSoundRecord> => {
  const data = new Uint8Array(await file.arrayBuffer());
  const meta = await sounds().add(
    {
      name: file.name.replace(/\.[^.]+$/, ''),
      mimeType: file.type || 'application/octet-stream',
      createdAt: Date.now(),
    },
    data,
  );

  return { ...meta, blob: file };
};

export const removeCustomSound = async (soundId: string): Promise<void> => {
  await sounds().remove(soundId);
};
