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

import type { TrackDefinition, TrackState } from '../../../../core/types/trackData';
import { STRINGS } from '../../../../strings';
import {
  editButtonSx,
  favButtonSx,
  paperSx,
  playButtonSx,
  rowSx,
  starBadgeSx,
  trackNameSx,
} from './TrackCard.styles';

type TrackCardProps = {
  track: TrackDefinition;
  trackState: TrackState;
  onToggle: (trackId: string, enabled: boolean) => void;
  onPlay: (trackId: string) => void;
  onEdit: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
};

const TrackCardInner = ({
  track,
  trackState,
  onToggle,
  onPlay,
  onEdit,
  onToggleFavorite,
}: TrackCardProps): React.ReactElement => {
  const isActive = (trackState.isPlaying && trackState.enabled) || trackState.isPreviewPlaying;

  return (
    <Paper
      variant="outlined"
      sx={paperSx(track.color, isActive)}
      data-testid={`track-card--${track.id}`}
    >
      <Box sx={rowSx}>
        <Tooltip title={trackState.enabled ? STRINGS.trackCard.removeFromMix : STRINGS.trackCard.addToMix}>
          <Checkbox
            checked={trackState.enabled}
            onChange={(_, checked) => onToggle(track.id, checked)}
            size="small"
            color="secondary"
            sx={{ p: 0.5 }}
          />
        </Tooltip>

        <Typography
          variant="body2"
          sx={trackNameSx(track.color, isActive)}
          title={track.name}
        >
          {track.name}
          {track.sourceTrackId != null && (
            <Typography component="span" sx={starBadgeSx}>
              ★
            </Typography>
          )}
        </Typography>

        <Tooltip
          title={trackState.isPreviewPlaying ? STRINGS.trackCard.stopPreview : STRINGS.trackCard.preview}
        >
          <IconButton
            size="small"
            onClick={() => onPlay(track.id)}
            sx={playButtonSx(track.color, trackState.isPreviewPlaying)}
            data-testid={`track-preview--${track.id}`}
          >
            {trackState.isPreviewPlaying ? (
              <PauseCircleIcon sx={{ fontSize: '18px' }} />
            ) : (
              <PlayCircleIcon sx={{ fontSize: '18px' }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip
          title={track.isFavorite ? STRINGS.trackCard.removeFromFavourites : STRINGS.trackCard.addToFavourites}
        >
          <IconButton
            size="small"
            onClick={() => onToggleFavorite(track.id)}
            sx={favButtonSx(track.isFavorite ?? false)}
            data-testid={`track-favorite--${track.id}`}
          >
            {track.isFavorite ? (
              <StarIcon sx={{ fontSize: '16px' }} />
            ) : (
              <StarBorderIcon sx={{ fontSize: '16px' }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title={STRINGS.trackCard.editTrack}>
          <IconButton
            size="small"
            onClick={() => onEdit(track.id)}
            sx={editButtonSx}
            data-testid={`track-edit--${track.id}`}
          >
            <EditIcon sx={{ fontSize: '16px' }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export const TrackCard = React.memo(
  TrackCardInner,
  (prev, next) => prev.track === next.track && prev.trackState === next.trackState,
);
