import type { TrackDefinition, TrackState } from '../types';

export const BASE_BPM = 120;
export const DEFAULT_GLOBAL_TEMPO = 1;

export const DEFAULT_TRACKS: TrackDefinition[] = [
  { id: 'drums', name: 'DRUMS', kind: 'demo', color: '#ff4fd8', loopLengthSeconds: 8 },
  { id: 'bass', name: 'BASS', kind: 'demo', color: '#40d9ff', loopLengthSeconds: 8 },
  { id: 'keys', name: 'KEYS', kind: 'demo', color: '#9f6bff', loopLengthSeconds: 8 },
  { id: 'arp', name: 'ARP', kind: 'demo', color: '#ff8f4f', loopLengthSeconds: 8 },
  { id: 'pad', name: 'PAD', kind: 'demo', color: '#6cff9f', loopLengthSeconds: 8 },
];

export const createDefaultTrackState = (): Record<string, TrackState> =>
  Object.fromEntries(
    DEFAULT_TRACKS.map((track) => [
      track.id,
      {
        enabled: false,
        volume: 0.78,
        speed: 1,
        followsGlobalTempo: true,
        isPlaying: false,
      },
    ]),
  );

export const createCustomTrackDefinition = (
  id: string,
  name: string,
  color: string,
  loopLengthSeconds: number,
): TrackDefinition => ({
  id,
  name,
  kind: 'custom',
  color,
  loopLengthSeconds,
  customSoundId: id,
});