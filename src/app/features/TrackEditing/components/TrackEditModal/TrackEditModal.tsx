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
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';

import type {
  TrackCategory,
  TrackDefinition,
  TrackSavedSettings,
  TrackState,
} from '../../../../core/types/trackData';
import { STRINGS } from '../../../../strings';
import { useTrackEditState } from '../../hooks/useTrackEditState';
import { TrackSlidersContent } from './components/TrackSlidersContent/TrackSlidersContent';
import { PresetNameField } from './components/PresetNameField/PresetNameField';
import { TrackSaveActions } from './components/TrackSaveActions/TrackSaveActions';
import {
  closeButtonSx,
  colorDotSx,
  dialogPaperSx,
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
    presetName,
    saveNewMode,
  } = state;

  const {
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
  } = stateActions;

  if (!track || !trackState) return <Box />;

  const isPreset = track.sourceTrackId != null;

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

  const handleSaveOver = () => {
    if (!presetName.trim()) return;
    onSaveOver(track.id, presetName.trim(), track.category, currentSettings);
    setSaveNewMode(false);
    onClose();
  };

  const handleSaveToTrack = () => {
    onSaveToTrack(track.id, currentSettings);
    setSaveNewMode(false);
    onClose();
  };

  const confirmSaveNew = () => {
    if (!presetName.trim()) return;
    const original = originalSettingsRef.current;
    if (!original) return;
    onSaveAsNew(
      track.id,
      presetName.trim(),
      track.category,
      currentSettings,
      original,
      originalIsPreviewPlayingRef.current,
    );
    setSaveNewMode(false);
    onClose();
  };

  const handleVolumeChange = (v: number) => { setVolume(v); onVolumeChange(track.id, v); };
  const handleSpeedChange = (v: number) => { setSpeed(v); onSpeedChange(track.id, v); };
  const handleEqLowChange = (v: number) => { setEqLow(v); onEqChange(track.id, v, eqMid, eqHigh); };
  const handleEqMidChange = (v: number) => { setEqMid(v); onEqChange(track.id, eqLow, v, eqHigh); };
  const handleEqHighChange = (v: number) => { setEqHigh(v); onEqChange(track.id, eqLow, eqMid, v); };
  const handleReverbChange = (v: number) => { setReverbSend(v); onEffectsChange(track.id, v, delaySend); };
  const handleDelayChange = (v: number) => { setDelaySend(v); onEffectsChange(track.id, reverbSend, v); };

  const S = STRINGS.trackEditModal;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: dialogPaperSx(track.color) } }}
      data-testid="track-edit-modal"
    >
      <DialogTitle sx={dialogTitleSx(track.color)}>
        <Box sx={colorDotSx(track.color)} />
        {S.title}
        <Tooltip title={S.discardChanges}>
          <IconButton size="small" onClick={handleDiscardChanges} sx={discardButtonSx}>
            <RestoreIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={handleCancel} sx={closeButtonSx}>
          <CloseIcon fontSize="small" />
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
              value={presetName}
              inputRef={nameInputRef}
              onChange={setPresetName}
              onConfirm={confirmSaveNew}
              onCancel={() => setSaveNewMode(false)}
            />
          )}
        </Stack>
      </DialogContent>

      <TrackSaveActions
        trackColor={track.color}
        isPreset={isPreset}
        saveNewMode={saveNewMode}
        presetNameValid={!!presetName.trim()}
        onSave={isPreset ? handleSaveOver : handleSaveToTrack}
        onSaveNewClick={() => setSaveNewMode(true)}
        onConfirmSaveNew={confirmSaveNew}
        onBack={() => setSaveNewMode(false)}
      />
    </Dialog>
  );
};
