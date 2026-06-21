import { AudioWaveform } from 'pixelarticons/react/AudioWaveform';
import { PenSquare } from 'pixelarticons/react/PenSquare';
import { Music } from 'pixelarticons/react/Music';
import { Trash } from 'pixelarticons/react/Trash';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { SavedMix } from '../../../../core/types/mixData';
import { PixelIcon } from '../../../../components';
import {
  cardSx,
  mixMetaSx,
  mixNameSx,
  playingDotSx,
  rowSx,
} from './MixLibraryCard.styles';

interface MixLibraryCardProps {
  mix: SavedMix;
  isActive: boolean;
  isSetPlaying: boolean;
  isSetPlaybackActive: boolean;
  onAdd: () => void;
  onLoad: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const MixLibraryCard = ({
  mix,
  isActive,
  isSetPlaying,
  isSetPlaybackActive,
  onAdd,
  onLoad,
  onRename,
  onDelete,
}: MixLibraryCardProps): React.ReactElement => {
  const trackCount = Object.values(mix.trackStates).filter(
    (ts) => ts.enabled,
  ).length;

  return (
    <Paper
      variant="outlined"
      sx={cardSx(isActive, isSetPlaying, isSetPlaybackActive)}
      onClick={isSetPlaybackActive ? undefined : onLoad}
      data-testid={`mix-library-card--${mix.id}`}
    >
      <Box sx={rowSx}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isSetPlaying && <Box sx={playingDotSx} />}
            {isActive && !isSetPlaying && (
              <Box sx={{ display: 'inline-flex', color: 'primary.main' }}>
                <PixelIcon glyph={AudioWaveform} />
              </Box>
            )}
            <Typography sx={mixNameSx}>{mix.name}</Typography>
          </Box>
          <Typography sx={mixMetaSx}>{trackCount} tracks</Typography>
        </Box>

        <Tooltip title={STRINGS.set.renameMix}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRename();
            }}
            sx={{ p: 0.25, color: 'text.disabled' }}
            data-testid={`mix-rename--${mix.id}`}
          >
            <PixelIcon glyph={PenSquare} />
          </IconButton>
        </Tooltip>

        <Tooltip title={STRINGS.set.deleteMix}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              p: 0.25,
              color: 'text.disabled',
              '&:hover': { color: 'error.main' },
            }}
            data-testid={`mix-delete--${mix.id}`}
          >
            <PixelIcon glyph={Trash} />
          </IconButton>
        </Tooltip>

        <Tooltip title={STRINGS.set.addToTimeline}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            sx={{
              p: 0.25,
              color: 'primary.main',
              '&:hover': { color: 'primary.light' },
            }}
            data-testid={`mix-add-to-timeline--${mix.id}`}
          >
            <PixelIcon glyph={Music} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};
