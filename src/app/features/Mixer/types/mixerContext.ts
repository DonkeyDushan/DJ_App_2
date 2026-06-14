/**
 * Type definitions for the Mixer React context value and actions.
 */

import type { AudioEngine } from '../../../core/audio/audioEngine';
import type { TrackCategory, TrackDefinition, TrackSavedSettings } from '../../../core/types/trackData';
import type { MixerSnapshot } from '../../../core/types/mixData';

export type MixerActions = {
  toggleTrack: (trackId: string, enabled: boolean) => Promise<void>;
  playTrackOnce: (trackId: string) => Promise<void>;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackSpeed: (trackId: string, speed: number) => void;
  setTrackEq: (
    trackId: string,
    eqLow: number,
    eqMid: number,
    eqHigh: number,
  ) => void;
  setTrackEffects: (
    trackId: string,
    reverbSend: number,
    delaySend: number,
  ) => void;
  setGlobalTempo: (tempo: number) => void;
  toggleTransport: () => Promise<void>;
  restartTransport: () => Promise<void>;
  loadMixAndPlay: (mixId: string, offsetSeconds?: number) => Promise<void>;
  loadInitialData: () => Promise<void>;
  addCustomSound: (file: File) => Promise<void>;
  deleteCustomSound: (soundId: string) => Promise<void>;
  saveMix: (name: string) => void;
  loadMix: (mixId: string) => Promise<void>;
  overwriteMix: (mixId: string) => void;
  clearMix: () => Promise<void>;
  resetMix: () => Promise<void>;
  deleteMix: (mixId: string) => void;
  saveTrackPreset: (
    sourceTrackId: string,
    name: string,
    category: TrackCategory,
    settings: TrackSavedSettings,
    existingPresetId?: string,
  ) => string;
  restoreTrackSettings: (
    trackId: string,
    settings: TrackSavedSettings,
  ) => void;
  deleteTrackPreset: (presetId: string) => void;
  toggleFavorite: (trackId: string) => void;
  saveTrackOverride: (trackId: string, settings: TrackSavedSettings) => void;
  toggleMixFavorite: (mixId: string) => void;
};

export type MixerContextValue = {
  snapshot: MixerSnapshot;
  tracks: TrackDefinition[];
  engine: AudioEngine;
  activeMixId: string | null;
  actions: MixerActions;
};
