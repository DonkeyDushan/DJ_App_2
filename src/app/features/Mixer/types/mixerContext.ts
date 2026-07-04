/**
 * Type definitions for the Mixer React context value and actions.
 */

import type { AudioEngine } from '../../../core/audio/audioEngine';
import type { TrackCategory, TrackDefinition, TrackSavedSettings } from '../../../core/types/trackData';
import type { MixerSnapshot, MixUpdate } from '../../../core/types/mixData';
import type { MixColorKey } from '../../../core/constants/mixColors';
import type { TransitionKind } from '../../../core/types/transition';

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
  transitionToMix: (
    mixId: string,
    kind: TransitionKind,
    durationSeconds: number,
    offsetSeconds?: number,
  ) => Promise<void>;
  loadInitialData: () => Promise<void>;
  addCustomSound: (file: File) => Promise<void>;
  deleteCustomSound: (soundId: string) => Promise<void>;
  renameCustomSound: (soundId: string, name: string) => Promise<void>;
  replaceCustomSound: (
    soundId: string,
    blob: Blob,
    mimeType: string,
  ) => Promise<void>;
  saveMix: (name: string, color: MixColorKey | null) => void;
  loadMix: (mixId: string) => Promise<void>;
  overwriteMix: (mixId: string) => void;
  clearMix: () => Promise<void>;
  resetMix: () => Promise<void>;
  deleteMix: (mixId: string) => void;
  duplicateMix: (mixId: string) => void;
  updateMix: (mixId: string, patch: MixUpdate) => void;
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
  renameTrackPreset: (presetId: string, name: string) => void;
  toggleFavorite: (trackId: string) => void;
  saveTrackOverride: (trackId: string, settings: TrackSavedSettings) => void;
};

export type MixerContextValue = {
  snapshot: MixerSnapshot;
  tracks: TrackDefinition[];
  engine: AudioEngine;
  activeMixId: string | null;
  /**
   * True while the user is building a brand-new mix that has not been saved
   * yet (either explicitly via "New mix" or by default when no saved mixes
   * exist). Drives the placeholder "Untitled" card in the mix library.
   */
  isNewMix: boolean;
  /**
   * True when the working mixer state differs from the mix it was loaded from
   * (or, for a new mix, has any enabled track). Gates the header "Save" button
   * and triggers the unsaved-changes prompt when switching mixes.
   */
  hasUnsavedMixChanges: boolean;
  actions: MixerActions;
};
