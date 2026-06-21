import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { SavedMix } from '../../../../core/types/mixData';
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
  onToggleFavorite: () => void;
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
  onToggleFavorite,
  onAdd,
  onLoad,
  onRename,
  onDelete,
}: MixLibraryCardProps): React.ReactElement => {
  const trackCount = Object.values(mix.trackStates).filter(
    (ts) => ts.enabled,
  ).length;
  const date = new Date(mix.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
  });

  return (
    <Paper
      variant="outlined"
      sx={cardSx(!!mix.isFavorite, isActive, isSetPlaying, isSetPlaybackActive)}
      onClick={isSetPlaybackActive ? undefined : onLoad}
      data-testid={`mix-library-card--${mix.id}`}
    >
      <Box sx={rowSx}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isSetPlaying && <Box sx={playingDotSx} />}
            {isActive && !isSetPlaying && (
              <GraphicEqIcon sx={{ fontSize: 10, color: 'primary.main' }} />
            )}
            <Typography sx={mixNameSx}>{mix.name}</Typography>
          </Box>
          <Typography sx={mixMetaSx}>
            {trackCount} tracks · {date}
          </Typography>
        </Box>

        <Tooltip
          title={
            mix.isFavorite
              ? STRINGS.set.removeFromFavourites
              : STRINGS.set.addToFavourites
          }
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            sx={{ p: 0.25, color: mix.isFavorite ? '#ffd84f' : 'text.disabled' }}
            data-testid={`mix-favorite--${mix.id}`}
          >
            {mix.isFavorite ? (
              <StarIcon sx={{ fontSize: 14 }} />
            ) : (
              <StarBorderIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title={STRINGS.set.addToTimeline}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            sx={{ p: 0.25, color: 'primary.main' }}
            data-testid={`mix-add-to-timeline--${mix.id}`}
          >
            <AddIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>

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
            <DriveFileRenameOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={STRINGS.set.deleteMix}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'error.main' } }}
            data-testid={`mix-delete--${mix.id}`}
          >
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};
