import React from 'react';

import { PenSquare } from 'pixelarticons/react/PenSquare';
import { Play } from 'pixelarticons/react/Play';
import { Star } from 'pixelarticons/react/Star';
import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import type {
  TrackDefinition,
  TrackState,
} from '../../../../core/types/trackData';
import { STRINGS } from '../../../../strings';
import { PixelIcon, PausePixelGlyph } from '../../../../components';
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
  const isActive =
    (trackState.isPlaying && trackState.enabled) || trackState.isPreviewPlaying;

  return (
    <Paper
      variant="outlined"
      sx={paperSx(track.color, isActive)}
      data-testid={`track-card--${track.id}`}
    >
      <Box sx={rowSx}>
        <Tooltip
          title={
            trackState.enabled
              ? STRINGS.trackCard.removeFromMix
              : STRINGS.trackCard.addToMix
          }
        >
          <Checkbox
            checked={trackState.enabled}
            onChange={(_, checked) => onToggle(track.id, checked)}
            size="small"
            color="secondary"
            sx={{ p: 0.5 }}
          />
        </Tooltip>

        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          gap={0.25}
          overflow="hidden"
        >
          <Typography
            variant="body2"
            sx={trackNameSx(track.color, isActive)}
            title={track.name}
            minWidth="80px"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {track.name}
            {track.sourceTrackId != null && (
              <Typography component="span" sx={starBadgeSx}>
                ★
              </Typography>
            )}
          </Typography>
          <Stack direction="row" alignItems="center" minWidth="60px">
            <Tooltip
              title={
                trackState.isPreviewPlaying
                  ? STRINGS.trackCard.stopPreview
                  : STRINGS.trackCard.preview
              }
            >
              <IconButton
                size="small"
                onClick={() => onPlay(track.id)}
                sx={playButtonSx(track.color, trackState.isPreviewPlaying)}
                data-testid={`track-preview--${track.id}`}
              >
                {trackState.isPreviewPlaying ? (
                  <PixelIcon glyph={PausePixelGlyph} />
                ) : (
                  <PixelIcon glyph={Play} />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip
              title={
                track.isFavorite
                  ? STRINGS.trackCard.removeFromFavourites
                  : STRINGS.trackCard.addToFavourites
              }
            >
              <IconButton
                size="small"
                onClick={() => onToggleFavorite(track.id)}
                sx={favButtonSx(track.isFavorite ?? false)}
                data-testid={`track-favorite--${track.id}`}
              >
                <PixelIcon glyph={Star} />
              </IconButton>
            </Tooltip>

            <Tooltip title={STRINGS.trackCard.editTrack}>
              <IconButton
                size="small"
                onClick={() => onEdit(track.id)}
                sx={editButtonSx}
                data-testid={`track-edit--${track.id}`}
              >
                <PixelIcon glyph={PenSquare} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export const TrackCard = React.memo(
  TrackCardInner,
  (prev, next) =>
    prev.track === next.track && prev.trackState === next.trackState,
);
