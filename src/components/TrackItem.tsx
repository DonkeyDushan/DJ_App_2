import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { Box, Button, Checkbox, Paper, Slider, Stack, Typography } from '@mui/material';

import type { TrackDefinition, TrackState } from '../types';

type TrackItemProps = {
  track: TrackDefinition;
  trackState: TrackState;
  onToggle: (trackId: string, enabled: boolean) => void;
  onPlay: (trackId: string) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
  onSpeedChange: (trackId: string, speed: number) => void;
};

export function TrackItem({ track, trackState, onToggle, onPlay, onVolumeChange, onSpeedChange }: TrackItemProps): React.ReactElement {
  return (
    <Paper
      sx={{
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        borderColor: trackState.isPlaying ? track.color : 'rgba(255,255,255,0.08)',
        boxShadow: trackState.isPlaying
          ? `0 0 0 1px ${track.color}66, 0 0 22px ${track.color}55, inset 0 0 22px ${track.color}12`
          : 'none',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.16,
          background: `radial-gradient(circle at top right, ${track.color}88, transparent 45%)`,
          pointerEvents: 'none',
        }}
      />
      <Stack spacing={1.5} sx={{ position: 'relative' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Checkbox checked={trackState.enabled} onChange={(_, checked) => onToggle(track.id, checked)} color="secondary" />
            <Typography variant="h6" sx={{ fontFamily: 'Orbitron, sans-serif', color: track.color }}>
              {track.name}
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              color: trackState.isPlaying ? track.color : 'text.secondary',
              fontSize: 12,
              letterSpacing: '0.16em',
            }}
          >
            <CheckCircleOutlineIcon fontSize="small" />
            {trackState.isPlaying ? 'PLAYING' : 'IDLE'}
          </Box>
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          startIcon={trackState.isPreviewPlaying ? <StopCircleIcon /> : <PlayArrowIcon />}
          onClick={() => onPlay(track.id)}
          sx={{ borderColor: `${track.color}88`, color: '#fff' }}
        >
          {trackState.isPreviewPlaying ? 'STOP' : 'PLAY'}
        </Button>

        <Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
            VOLUME
          </Typography>
          <Slider
            value={trackState.volume}
            min={0}
            max={1.2}
            step={0.01}
            onChange={(_, value) => onVolumeChange(track.id, Array.isArray(value) ? value[0] : value)}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
            SPEED
          </Typography>
          <Slider
            value={trackState.speed}
            min={0.5}
            max={1.5}
            step={0.01}
            onChange={(_, value) => onSpeedChange(track.id, Array.isArray(value) ? value[0] : value)}
            valueLabelDisplay="auto"
          />
        </Box>
      </Stack>
    </Paper>
  );
}