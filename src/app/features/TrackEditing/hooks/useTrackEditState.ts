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
  presetNameValid: boolean;
  saveNewMode: boolean;
  renameMode: boolean;
};

export type TrackEditStateActions = {
  setVolume: (v: number) => void;
  setSpeed: (v: number) => void;
  setEqLow: (v: number) => void;
  setEqMid: (v: number) => void;
  setEqHigh: (v: number) => void;
  setReverbSend: (v: number) => void;
  setDelaySend: (v: number) => void;
  setPresetNameValid: (valid: boolean) => void;
  setSaveNewMode: (active: boolean) => void;
  setRenameMode: (active: boolean) => void;
  presetNameRef: React.MutableRefObject<string>;
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
  const [presetNameValid, setPresetNameValid] = useState(false);
  const [saveNewMode, setSaveNewMode] = useState(false);
  const [renameMode, setRenameMode] = useState(false);

  const presetNameRef = useRef('');
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
    presetNameRef.current = track.name;
    setPresetNameValid(!!track.name.trim());
    setSaveNewMode(false);
    setRenameMode(false);
  }, [open, track, track?.id, trackState]);

  // Auto-select the name input when entering save-new or rename mode.
  useEffect(() => {
    if (saveNewMode || renameMode) {
      setTimeout(() => nameInputRef.current?.select(), NAME_SELECT_DELAY_MS);
    }
  }, [saveNewMode, renameMode]);

  const state: TrackEditLocalState = {
    volume,
    speed,
    eqLow,
    eqMid,
    eqHigh,
    reverbSend,
    delaySend,
    presetNameValid,
    saveNewMode,
    renameMode,
  };

  const stateActions: TrackEditStateActions = {
    setVolume,
    setSpeed,
    setEqLow,
    setEqMid,
    setEqHigh,
    setReverbSend,
    setDelaySend,
    setPresetNameValid,
    setSaveNewMode,
    setRenameMode,
    presetNameRef,
    originalSettingsRef,
    originalIsPreviewPlayingRef,
    nameInputRef,
  };

  return [state, stateActions];
};
