import React from 'react';

import { PenSquare } from 'pixelarticons/react/PenSquare';
import { Play } from 'pixelarticons/react/Play';
import { Sparkle } from 'pixelarticons/react/Sparkle';
import { Checkbox as CheckboxIcon } from 'pixelarticons/react/Checkbox';
import { CheckboxOn } from 'pixelarticons/react/CheckboxOn';
import {
  Box,
  Checkbox,
  FormControlLabel,
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
  checkBoxSx,
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
    <Paper sx={paperSx(isActive)} data-testid={`track-card--${track.id}`}>
      <Box sx={rowSx}>
        <FormControlLabel
          sx={{ minWidth: '100px' }}
          label={
            <Typography
              variant="body2"
              sx={trackNameSx}
              title={track.name}
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
          }
          control={
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
                icon={<PixelIcon glyph={CheckboxIcon} />}
                checkedIcon={<PixelIcon glyph={CheckboxOn} />}
                sx={checkBoxSx}
              />
            </Tooltip>
          }
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          minWidth="fit-content"
        >
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
              sx={playButtonSx(trackState.isPreviewPlaying)}
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
              <PixelIcon glyph={Sparkle} />
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
    </Paper>
  );
};

export const TrackCard = React.memo(
  TrackCardInner,
  (prev, next) =>
    prev.track === next.track && prev.trackState === next.trackState,
);
