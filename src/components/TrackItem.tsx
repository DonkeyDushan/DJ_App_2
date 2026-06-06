import React from 'react';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Slider,
  Stack,
  Typography,
} from '@mui/material';

import type { TrackDefinition, TrackState } from '../types';
import {
  controlLabelSx,
  eqLabelSx,
  glowOverlaySx,
  paperSx,
  playButtonSx,
  sliderLabelSx,
  statusBadgeSx,
  trackNameSx,
} from './TrackItem.styles';

type TrackItemProps = {
  track: TrackDefinition;
  trackState: TrackState;
  onToggle: (trackId: string, enabled: boolean) => void;
  onPlay: (trackId: string) => void;
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

export const TrackItem = ({
  track,
  trackState,
  onToggle,
  onPlay,
  onVolumeChange,
  onSpeedChange,
  onEqChange,
  onEffectsChange,
}: TrackItemProps): React.ReactElement => {
  return (
    <Paper sx={paperSx(track.color, trackState.isPlaying)}>
      <Box sx={glowOverlaySx(track.color)} />
      <Stack spacing={1.5} sx={{ position: 'relative' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Checkbox
              checked={trackState.enabled}
              onChange={(_, checked) => onToggle(track.id, checked)}
              color="secondary"
            />
            <Typography variant="h6" sx={trackNameSx(track.color)}>
              {track.name}
            </Typography>
          </Stack>
          <Box sx={statusBadgeSx(track.color, trackState.isPlaying)}>
            <CheckCircleOutlineIcon fontSize="small" />
            {trackState.isPlaying ? 'PLAYING' : 'IDLE'}
          </Box>
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          startIcon={
            trackState.isPreviewPlaying ? <StopCircleIcon /> : <PlayArrowIcon />
          }
          onClick={() => onPlay(track.id)}
          sx={playButtonSx(track.color)}
        >
          {trackState.isPreviewPlaying ? 'STOP' : 'PLAY'}
        </Button>

        <Box>
          <Typography variant="caption" sx={sliderLabelSx}>
            VOLUME
          </Typography>
          <Slider
            value={trackState.volume}
            min={0}
            max={1.2}
            step={0.01}
            onChange={(_, value) =>
              onVolumeChange(track.id, Array.isArray(value) ? value[0] : value)
            }
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={sliderLabelSx}>
            SPEED
          </Typography>
          <Slider
            value={trackState.speed}
            min={0.5}
            max={1.5}
            step={0.01}
            onChange={(_, value) =>
              onSpeedChange(track.id, Array.isArray(value) ? value[0] : value)
            }
            valueLabelDisplay="auto"
          />
        </Box>

        <Stack spacing={1}>
          <Typography variant="caption" sx={eqLabelSx}>
            EQ (dB)
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={controlLabelSx('1.625rem')}>
              LOW
            </Typography>
            <Slider
              value={trackState.eqLow}
              min={-12}
              max={12}
              step={0.5}
              onChange={(_, value) =>
                onEqChange(
                  track.id,
                  Array.isArray(value) ? value[0] : value,
                  trackState.eqMid,
                  trackState.eqHigh,
                )
              }
              valueLabelDisplay="auto"
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={controlLabelSx('1.625rem')}>
              MID
            </Typography>
            <Slider
              value={trackState.eqMid}
              min={-12}
              max={12}
              step={0.5}
              onChange={(_, value) =>
                onEqChange(
                  track.id,
                  trackState.eqLow,
                  Array.isArray(value) ? value[0] : value,
                  trackState.eqHigh,
                )
              }
              valueLabelDisplay="auto"
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={controlLabelSx('1.625rem')}>
              HIGH
            </Typography>
            <Slider
              value={trackState.eqHigh}
              min={-12}
              max={12}
              step={0.5}
              onChange={(_, value) =>
                onEqChange(
                  track.id,
                  trackState.eqLow,
                  trackState.eqMid,
                  Array.isArray(value) ? value[0] : value,
                )
              }
              valueLabelDisplay="auto"
            />
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="caption" sx={eqLabelSx}>
            FX SEND
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={controlLabelSx('3rem')}>
              REVERB
            </Typography>
            <Slider
              value={trackState.reverbSend}
              min={0}
              max={1}
              step={0.01}
              onChange={(_, value) =>
                onEffectsChange(
                  track.id,
                  Array.isArray(value) ? value[0] : value,
                  trackState.delaySend,
                )
              }
              valueLabelDisplay="auto"
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={controlLabelSx('3rem')}>
              DELAY
            </Typography>
            <Slider
              value={trackState.delaySend}
              min={0}
              max={1}
              step={0.01}
              onChange={(_, value) =>
                onEffectsChange(
                  track.id,
                  trackState.reverbSend,
                  Array.isArray(value) ? value[0] : value,
                )
              }
              valueLabelDisplay="auto"
            />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};
