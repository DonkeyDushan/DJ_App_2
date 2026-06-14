/**
 * Manages the local slider state and original-settings snapshot for TrackEditModal.
 * Initialises slider values when the modal opens for a new track,
 * and exposes helpers to sync local state with external callbacks.
 */

import { useEffect, useRef, useState } from 'react';

import type { TrackDefinition, TrackSavedSettings, TrackState } from '../../../core/types/trackData';

/** Delay in ms before auto-selecting the preset name input on save-new mode entry. */
const NAME_SELECT_DELAY_MS = 50;

export type TrackEditLocalState = {
  volume: number;
  speed: number;
  eqLow: number;
  eqMid: number;
  eqHigh: number;
  reverbSend: number;
  delaySend: number;
  presetName: string;
  saveNewMode: boolean;
};

export type TrackEditStateActions = {
  setVolume: (v: number) => void;
  setSpeed: (v: number) => void;
  setEqLow: (v: number) => void;
  setEqMid: (v: number) => void;
  setEqHigh: (v: number) => void;
  setReverbSend: (v: number) => void;
  setDelaySend: (v: number) => void;
  setPresetName: (name: string) => void;
  setSaveNewMode: (active: boolean) => void;
  originalSettingsRef: React.MutableRefObject<TrackSavedSettings | null>;
  originalIsPreviewPlayingRef: React.MutableRefObject<boolean>;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
};

export const useTrackEditState = (
  open: boolean,
  track: TrackDefinition | null,
  trackState: TrackState | null,
): [TrackEditLocalState, TrackEditStateActions] => {
  const [volume, setVolume] = useState(0.78);
  const [speed, setSpeed] = useState(1);
  const [eqLow, setEqLow] = useState(0);
  const [eqMid, setEqMid] = useState(0);
  const [eqHigh, setEqHigh] = useState(0);
  const [reverbSend, setReverbSend] = useState(0);
  const [delaySend, setDelaySend] = useState(0);
  const [presetName, setPresetName] = useState('');
  const [saveNewMode, setSaveNewMode] = useState(false);

  const originalSettingsRef = useRef<TrackSavedSettings | null>(null);
  const originalIsPreviewPlayingRef = useRef(false);
  const initializedTrackIdRef = useRef<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Initialise slider values when the modal opens for a new track.
  useEffect(() => {
    if (!open) {
      initializedTrackIdRef.current = null;

      return;
    }
    if (!trackState || !track) return;
    if (initializedTrackIdRef.current === track.id) return;

    initializedTrackIdRef.current = track.id;
    const original: TrackSavedSettings = {
      volume: trackState.volume,
      speed: trackState.speed,
      followsGlobalTempo: trackState.followsGlobalTempo,
      eqLow: trackState.eqLow,
      eqMid: trackState.eqMid,
      eqHigh: trackState.eqHigh,
      reverbSend: trackState.reverbSend,
      delaySend: trackState.delaySend,
    };
    originalSettingsRef.current = original;
    originalIsPreviewPlayingRef.current = trackState.isPreviewPlaying;
    setVolume(trackState.volume);
    setSpeed(trackState.speed);
    setEqLow(trackState.eqLow);
    setEqMid(trackState.eqMid);
    setEqHigh(trackState.eqHigh);
    setReverbSend(trackState.reverbSend);
    setDelaySend(trackState.delaySend);
    setPresetName(track.name);
    setSaveNewMode(false);
  }, [open, track, track?.id, trackState]);

  // Auto-select the name input when entering save-new mode.
  useEffect(() => {
    if (saveNewMode) {
      setTimeout(() => nameInputRef.current?.select(), NAME_SELECT_DELAY_MS);
    }
  }, [saveNewMode]);

  const state: TrackEditLocalState = {
    volume,
    speed,
    eqLow,
    eqMid,
    eqHigh,
    reverbSend,
    delaySend,
    presetName,
    saveNewMode,
  };

  const stateActions: TrackEditStateActions = {
    setVolume,
    setSpeed,
    setEqLow,
    setEqMid,
    setEqHigh,
    setReverbSend,
    setDelaySend,
    setPresetName,
    setSaveNewMode,
    originalSettingsRef,
    originalIsPreviewPlayingRef,
    nameInputRef,
  };

  return [state, stateActions];
};
