import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import type {
  TrackCategory,
  TrackDefinition,
  TrackSavedSettings,
  TrackState,
} from '../types';
import { STRINGS } from '../strings';
import { SliderRow } from './SliderRow';

type TrackEditModalProps = {
  open: boolean;
  track: TrackDefinition | null;
  trackState: TrackState | null;
  onClose: () => void;
  /**
   * "Save new" – creates a brand-new preset.
   * editedTrackId: currently edited track that should be reverted after save-new.
   * originalSettings: what to restore on the edited track.
   * wasPreviewPlaying: whether to transfer playback to the new preset.
   */
  onSaveAsNew: (
    editedTrackId: string,
    name: string,
    category: TrackCategory,
    settings: TrackSavedSettings,
    originalSettings: TrackSavedSettings,
    wasPreviewPlaying: boolean,
  ) => void;
  /** "Save" – overwrite an existing preset (only for preset tracks). */
  onSaveOver: (
    presetId: string,
    name: string,
    category: TrackCategory,
    settings: TrackSavedSettings,
  ) => void;
  /** "Save" – persist current settings to a base (non-preset) track. */
  onSaveToTrack: (trackId: string, settings: TrackSavedSettings) => void;
  /** Revert live audio/state changes (called on cancel). */
  onRestoreChanges: (trackId: string, settings: TrackSavedSettings) => void;
  // Live update callbacks (real-time audio preview while sliders move)
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

export function TrackEditModal({
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
}: TrackEditModalProps): React.ReactElement {
  const [volume, setVolume] = useState(0.78);
  const [speed, setSpeed] = useState(1);
  const [eqLow, setEqLow] = useState(0);
  const [eqMid, setEqMid] = useState(0);
  const [eqHigh, setEqHigh] = useState(0);
  const [reverbSend, setReverbSend] = useState(0);
  const [delaySend, setDelaySend] = useState(0);
  const [presetName, setPresetName] = useState('');
  // Two-step "Save new": first click enters rename mode, second confirms
  const [saveNewMode, setSaveNewMode] = useState(false);

  // Snapshot of values when modal opened — used for revert on cancel
  const originalSettingsRef = useRef<TrackSavedSettings | null>(null);
  const originalIsPreviewPlayingRef = useRef(false);
  const initializedTrackIdRef = useRef<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Initialize modal state only once per open/track selection.
  // Do not resync on every slider change, otherwise cancel/save-new revert breaks.
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

  // Focus rename field when save-new mode activates
  useEffect(() => {
    if (saveNewMode) {
      setTimeout(() => nameInputRef.current?.select(), 50);
    }
  }, [saveNewMode]);

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

  /** Cancel – revert all live changes. */
  const handleCancel = () => {
    if (originalSettingsRef.current) {
      onRestoreChanges(track.id, originalSettingsRef.current);
    }
    setSaveNewMode(false);
    onClose();
  };

  /** "Save" – overwrite preset, keep live changes. */
  const handleSaveOver = () => {
    if (!presetName.trim()) return;
    onSaveOver(track.id, presetName.trim(), track.category, currentSettings);
    setSaveNewMode(false);
    onClose();
  };

  /** "Save" – persist settings to a base track (no revert, no new entry). */
  const handleSaveToTrack = () => {
    onSaveToTrack(track.id, currentSettings);
    setSaveNewMode(false);
    onClose();
  };

  /** First click on "Save new" → enter rename mode. */
  const handleSaveNewClick = () => setSaveNewMode(true);

  /** Confirm save-new after name entered. */
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
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(160deg, #1a1230 0%, #0d0d1a 100%)',
          border: `1px solid ${track.color}44`,
          boxShadow: `0 0 40px ${track.color}22`,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.9rem',
          color: track.color,
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: track.color,
            boxShadow: `0 0 8px ${track.color}`,
            flexShrink: 0,
          }}
        />
        {S.title}
        <IconButton
          size="small"
          onClick={handleCancel}
          sx={{ ml: 'auto', color: 'text.disabled' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          {/* Volume & Speed */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Orbitron, monospace',
                color: 'text.disabled',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
              }}
            >
              {S.levels}
            </Typography>
            <Stack spacing={0.5} mt={0.5}>
              <SliderRow
                label={S.vol}
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={handleVolumeChange}
                valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                color={track.color}
              />
              <SliderRow
                label={S.speed}
                value={speed}
                min={0.25}
                max={4}
                step={0.01}
                onChange={handleSpeedChange}
                valueLabelFormat={(v) => `${v.toFixed(2)}x`}
              />
            </Stack>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

          {/* EQ */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Orbitron, monospace',
                color: 'text.disabled',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
              }}
            >
              {S.eq}
            </Typography>
            <Stack spacing={0.5} mt={0.5}>
              <SliderRow
                label={S.low}
                value={eqLow}
                min={-12}
                max={12}
                step={0.5}
                onChange={handleEqLowChange}
                valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
                color="#40d9ff"
              />
              <SliderRow
                label={S.mid}
                value={eqMid}
                min={-12}
                max={12}
                step={0.5}
                onChange={handleEqMidChange}
                valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
                color="#9f6bff"
              />
              <SliderRow
                label={S.high}
                value={eqHigh}
                min={-12}
                max={12}
                step={0.5}
                onChange={handleEqHighChange}
                valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
                color="#ff8f4f"
              />
            </Stack>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

          {/* FX */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Orbitron, monospace',
                color: 'text.disabled',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
              }}
            >
              {S.fxSends}
            </Typography>
            <Stack spacing={0.5} mt={0.5}>
              <SliderRow
                label={S.reverb}
                value={reverbSend}
                min={0}
                max={1}
                step={0.01}
                onChange={handleReverbChange}
                valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                color="#6cff9f"
              />
              <SliderRow
                label={S.delay}
                value={delaySend}
                min={0}
                max={1}
                step={0.01}
                onChange={handleDelayChange}
                valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                color="#ffd84f"
              />
            </Stack>
          </Box>

          {/* Name field – appears in save-new mode */}
          {saveNewMode && (
            <>
              <Divider sx={{ borderColor: `${track.color}44` }} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'Orbitron, monospace',
                    color: track.color,
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  {S.nameNewPreset}
                </Typography>
                <TextField
                  inputRef={nameInputRef}
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmSaveNew();
                    if (e.key === 'Escape') setSaveNewMode(false);
                  }}
                  size="small"
                  fullWidth
                  variant="outlined"
                  placeholder={S.presetNamePlaceholder}
                  sx={{
                    mt: 0.75,
                    '& .MuiInputBase-input': {
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '0.8rem',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: `${track.color}66`,
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
        {/* Back button when in rename mode */}
        {saveNewMode && (
          <Button
            size="small"
            variant="text"
            onClick={() => setSaveNewMode(false)}
            sx={{ fontSize: '0.7rem', color: 'text.disabled', mr: 'auto' }}
          >
            {S.back}
          </Button>
        )}

        {/* Save (overwrite) – for existing presets; Save (persist) for base tracks */}
        {!saveNewMode && (
          <Tooltip
            title={isPreset ? S.overwritePresetTooltip : S.saveToTrackTooltip}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveIcon />}
              onClick={isPreset ? handleSaveOver : handleSaveToTrack}
              color="secondary"
              sx={{ fontSize: '0.7rem', fontFamily: 'Orbitron, monospace' }}
            >
              {S.save}
            </Button>
          </Tooltip>
        )}

        {/* Save new – first click enters rename mode, second confirms */}
        {!saveNewMode ? (
          <Tooltip title={S.saveAsNewTooltip}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleSaveNewClick}
              sx={{
                fontSize: '0.7rem',
                fontFamily: 'Orbitron, monospace',
                background: `linear-gradient(90deg, ${track.color}cc, ${track.color}88)`,
                color: '#000',
                '&:hover': { background: track.color },
              }}
            >
              {S.saveNew}
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            onClick={confirmSaveNew}
            disabled={!presetName.trim()}
            sx={{
              fontSize: '0.7rem',
              fontFamily: 'Orbitron, monospace',
              background: `linear-gradient(90deg, ${track.color}cc, ${track.color}88)`,
              color: '#000',
              '&:hover': { background: track.color },
            }}
          >
            {S.confirm}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
