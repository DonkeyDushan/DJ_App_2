import React from 'react';

import EditIcon from '@mui/icons-material/Edit';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';

import type { TrackDefinition, TrackState } from '../types';

type TrackCardProps = {
  track: TrackDefinition;
  trackState: TrackState;
  onToggle: (trackId: string, enabled: boolean) => void;
  onPlay: (trackId: string) => void;
  onEdit: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
};

export function TrackCard({
  track,
  trackState,
  onToggle,
  onPlay,
  onEdit,
  onToggleFavorite,
}: TrackCardProps): React.ReactElement {
  const isActive = trackState.isPlaying || trackState.isPreviewPlaying;

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        borderColor: isActive
          ? track.color
          : 'rgba(255,255,255,0.08)',
        boxShadow: isActive ? `0 0 14px ${track.color}44` : 'none',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        background: isActive
          ? `linear-gradient(135deg, ${track.color}14 0%, transparent 60%)`
          : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {/* Mix checkbox */}
        <Tooltip title={trackState.enabled ? 'Remove from mix' : 'Add to mix'}>
          <Checkbox
            checked={trackState.enabled}
            onChange={(_, checked) => onToggle(track.id, checked)}
            size="small"
            color="secondary"
            sx={{ p: 0.5 }}
          />
        </Tooltip>

        {/* Track name */}
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontFamily: 'Orbitron, monospace',
            color: isActive ? track.color : 'text.primary',
            fontSize: '0.7rem',
            letterSpacing: '0.06em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
          title={track.name}
        >
          {track.name}
          {track.sourceTrackId != null && (
            <Typography
              component="span"
              sx={{
                fontSize: '0.6rem',
                color: 'text.disabled',
                ml: 0.5,
                fontFamily: 'inherit',
              }}
            >
              ★
            </Typography>
          )}
        </Typography>

        {/* Preview play/pause */}
        <Tooltip
          title={trackState.isPreviewPlaying ? 'Stop preview' : 'Preview'}
        >
          <IconButton
            size="small"
            onClick={() => onPlay(track.id)}
            sx={{
              color: trackState.isPreviewPlaying
                ? track.color
                : 'text.secondary',
              p: 0.5,
            }}
          >
            {trackState.isPreviewPlaying ? (
              <PauseCircleIcon sx={{ fontSize: 18 }} />
            ) : (
              <PlayCircleIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Favourite toggle */}
        <Tooltip
          title={
            track.isFavorite ? 'Remove from favourites' : 'Add to favourites'
          }
        >
          <IconButton
            size="small"
            onClick={() => onToggleFavorite(track.id)}
            sx={{
              color: track.isFavorite ? '#ffd84f' : 'text.disabled',
              p: 0.5,
            }}
          >
            {track.isFavorite ? (
              <StarIcon sx={{ fontSize: 16 }} />
            ) : (
              <StarBorderIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Edit */}
        <Tooltip title="Edit track">
          <IconButton
            size="small"
            onClick={() => onEdit(track.id)}
            sx={{ color: 'text.secondary', p: 0.5 }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}
