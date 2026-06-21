import { AudioWaveform } from 'pixelarticons/react/AudioWaveform';
import { PenSquare } from 'pixelarticons/react/PenSquare';
import { Music } from 'pixelarticons/react/Music';
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
  onEdit: () => void;
}

export const MixLibraryCard = ({
  mix,
  isActive,
  isSetPlaying,
  isSetPlaybackActive,
  onAdd,
  onLoad,
  onEdit,
}: MixLibraryCardProps): React.ReactElement => {
  const trackCount = Object.values(mix.trackStates).filter(
    (ts) => ts.enabled,
  ).length;

  return (
    <Paper
      sx={cardSx(isActive, isSetPlaying, isSetPlaybackActive)}
      onClick={isSetPlaybackActive ? undefined : onLoad}
      data-testid={`mix-library-card--${mix.id}`}
    >
      <Box sx={rowSx}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isSetPlaying && <Box sx={playingDotSx} />}
            {isActive && !isSetPlaying && (
              <Box
                sx={{
                  display: 'inline-flex',
                  color: 'primary.main',
                  mt: '-4px',
                }}
              >
                <PixelIcon glyph={AudioWaveform} />
              </Box>
            )}
            <Typography sx={mixNameSx}>{mix.name}</Typography>
          </Box>
          <Typography sx={mixMetaSx}>{trackCount} tracks</Typography>
        </Box>

        <Tooltip title={STRINGS.set.editMix}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{ p: 0.25, color: 'text.disabled' }}
            data-testid={`mix-edit--${mix.id}`}
          >
            <PixelIcon glyph={PenSquare} />
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
