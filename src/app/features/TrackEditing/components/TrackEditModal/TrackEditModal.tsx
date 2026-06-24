import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import { Close } from 'pixelarticons/react/Close';
import { Undo } from 'pixelarticons/react/Undo';

import type {
  TrackCategory,
  TrackDefinition,
  TrackSavedSettings,
  TrackState,
} from '../../../../core/types/trackData';
import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import { useTrackEditState } from '../../hooks/useTrackEditState';
import { TrackSlidersContent } from './components/TrackSlidersContent/TrackSlidersContent';
import { PresetNameField } from './components/PresetNameField/PresetNameField';
import { TrackSaveActions } from './components/TrackSaveActions/TrackSaveActions';
import {
  closeButtonSx,
  colorDotSx,
  dialogTitleSx,
  discardButtonSx,
} from './TrackEditModal.styles';

type TrackEditModalProps = {
  open: boolean;
  track: TrackDefinition | null;
  trackState: TrackState | null;
  onClose: () => void;
  onSaveAsNew: (
    editedTrackId: string,
    name: string,
    category: TrackCategory,
    settings: TrackSavedSettings,
    originalSettings: TrackSavedSettings,
    wasPreviewPlaying: boolean,
  ) => void;
  onSaveOver: (
    presetId: string,
    name: string,
    category: TrackCategory,
    settings: TrackSavedSettings,
  ) => void;
  onSaveToTrack: (trackId: string, settings: TrackSavedSettings) => void;
  onRestoreChanges: (trackId: string, settings: TrackSavedSettings) => void;
  onRenameTrack: (trackId: string, name: string) => void;
  onRequestDelete: (trackId: string) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
  onSpeedChange: (trackId: string, speed: number) => void;
  onEqChange: (
    trackId: string,
    eqLow: number,
    eqMid: number,
    eqHigh: number,
  ) => void;
  onEffectsChange: (
    trackId: string,
    reverbSend: number,
    delaySend: number,
  ) => void;
};

export const TrackEditModal = ({
  open,
  track,
  trackState,
  onClose,
  onSaveAsNew,
  onSaveOver,
  onSaveToTrack,
  onRestoreChanges,
  onRenameTrack,
  onRequestDelete,
  onVolumeChange,
  onSpeedChange,
  onEqChange,
  onEffectsChange,
}: TrackEditModalProps): React.ReactElement => {
  const [state, stateActions] = useTrackEditState(open, track, trackState);

  const {
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
  } = state;

  const {
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
  } = stateActions;

  if (!track || !trackState) return <Box />;

  const isPreset = track.sourceTrackId != null;

  // Non-original tracks (user presets and custom audio) can be renamed/deleted.
  const isModifiable = isPreset || track.kind === 'custom';

  const currentSettings: TrackSavedSettings = {
    volume,
    speed,
    followsGlobalTempo: trackState.followsGlobalTempo,
    eqLow,
    eqMid,
    eqHigh,
    reverbSend,
    delaySend,
  };

  const handleDiscardChanges = () => {
    const original = originalSettingsRef.current;
    if (!original) return;
    onRestoreChanges(track.id, original);
    setVolume(original.volume);
    setSpeed(original.speed);
    setEqLow(original.eqLow);
    setEqMid(original.eqMid);
    setEqHigh(original.eqHigh);
    setReverbSend(original.reverbSend);
    setDelaySend(original.delaySend);
  };

  const handleCancel = () => {
    if (originalSettingsRef.current) {
      onRestoreChanges(track.id, originalSettingsRef.current);
    }
    setSaveNewMode(false);
    onClose();
  };

  const handleRenameClick = () => {
    presetNameRef.current = track.name;
    setPresetNameValid(!!track.name.trim());
    setRenameMode(true);
  };

  const confirmRename = () => {
    const name = presetNameRef.current.trim();
    if (!name) return;
    onRenameTrack(track.id, name);
    setRenameMode(false);
  };

  const handleRequestDelete = () => {
    handleCancel();
    onRequestDelete(track.id);
  };

  const handleSaveOver = () => {
    if (!presetNameRef.current.trim()) return;
    onSaveOver(
      track.id,
      presetNameRef.current.trim(),
      track.category,
      currentSettings,
    );
    setSaveNewMode(false);
    onClose();
  };

  const handleSaveToTrack = () => {
    onSaveToTrack(track.id, currentSettings);
    setSaveNewMode(false);
    onClose();
  };

  const confirmSaveNew = () => {
    if (!presetNameRef.current.trim()) return;
    const original = originalSettingsRef.current;
    if (!original) return;
    onSaveAsNew(
      track.id,
      presetNameRef.current.trim(),
      track.category,
      currentSettings,
      original,
      originalIsPreviewPlayingRef.current,
    );
    setSaveNewMode(false);
    onClose();
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    onVolumeChange(track.id, v);
  };
  const handleSpeedChange = (v: number) => {
    setSpeed(v);
    onSpeedChange(track.id, v);
  };
  const handleEqLowChange = (v: number) => {
    setEqLow(v);
    onEqChange(track.id, v, eqMid, eqHigh);
  };
  const handleEqMidChange = (v: number) => {
    setEqMid(v);
    onEqChange(track.id, eqLow, v, eqHigh);
  };
  const handleEqHighChange = (v: number) => {
    setEqHigh(v);
    onEqChange(track.id, eqLow, eqMid, v);
  };
  const handleReverbChange = (v: number) => {
    setReverbSend(v);
    onEffectsChange(track.id, v, delaySend);
  };
  const handleDelayChange = (v: number) => {
    setDelaySend(v);
    onEffectsChange(track.id, reverbSend, v);
  };

  const S = STRINGS.trackEditModal;

  return (
    <Dialog open={open} onClose={handleCancel} data-testid="track-edit-modal">
      <DialogTitle sx={dialogTitleSx(track.color)}>
        <Box sx={colorDotSx(track.color)} />
        {S.title}
        <Tooltip title={S.discardChanges}>
          <IconButton
            size="small"
            onClick={handleDiscardChanges}
            sx={discardButtonSx}
          >
            <PixelIcon glyph={Undo} />
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={handleCancel} sx={closeButtonSx}>
          <PixelIcon glyph={Close} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <TrackSlidersContent
            trackColor={track.color}
            volume={volume}
            speed={speed}
            eqLow={eqLow}
            eqMid={eqMid}
            eqHigh={eqHigh}
            reverbSend={reverbSend}
            delaySend={delaySend}
            onVolumeChange={handleVolumeChange}
            onSpeedChange={handleSpeedChange}
            onEqLowChange={handleEqLowChange}
            onEqMidChange={handleEqMidChange}
            onEqHighChange={handleEqHighChange}
            onReverbChange={handleReverbChange}
            onDelayChange={handleDelayChange}
          />

          {saveNewMode && (
            <PresetNameField
              trackColor={track.color}
              label={S.nameNewPreset}
              initialName={presetNameRef.current}
              nameRef={presetNameRef}
              inputRef={nameInputRef}
              onValidChange={setPresetNameValid}
              onConfirm={confirmSaveNew}
              onCancel={() => setSaveNewMode(false)}
            />
          )}

          {renameMode && (
            <PresetNameField
              trackColor={track.color}
              label={S.renameLabel}
              initialName={track.name}
              nameRef={presetNameRef}
              inputRef={nameInputRef}
              onValidChange={setPresetNameValid}
              onConfirm={confirmRename}
              onCancel={() => setRenameMode(false)}
            />
          )}
        </Stack>
      </DialogContent>

      <TrackSaveActions
        trackColor={track.color}
        isPreset={isPreset}
        isModifiable={isModifiable}
        saveNewMode={saveNewMode}
        renameMode={renameMode}
        presetNameValid={presetNameValid}
        onSave={isPreset ? handleSaveOver : handleSaveToTrack}
        onSaveNewClick={() => setSaveNewMode(true)}
        onConfirmSaveNew={confirmSaveNew}
        onBack={() => setSaveNewMode(false)}
        onRenameClick={handleRenameClick}
        onConfirmRename={confirmRename}
        onRenameBack={() => setRenameMode(false)}
        onDelete={handleRequestDelete}
      />
    </Dialog>
  );
};
