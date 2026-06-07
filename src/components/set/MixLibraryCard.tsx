import { useDraggable } from '@dnd-kit/core';
import AddIcon from '@mui/icons-material/Add';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../strings';
import type { SavedMix } from '../../types';
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
}

export const MixLibraryCard = ({
  mix,
  isActive,
  isSetPlaying,
  isSetPlaybackActive,
  onToggleFavorite,
  onAdd,
  onLoad,
}: MixLibraryCardProps): React.ReactElement => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib-${mix.id}`,
    data: { type: 'library-mix', mixId: mix.id },
  });

  const trackCount = Object.values(mix.trackStates).filter(
    (ts) => ts.enabled,
  ).length;
  const date = new Date(mix.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
  });

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={cardSx(!!mix.isFavorite, isDragging, isActive, isSetPlaying, isSetPlaybackActive)}
      onClick={isSetPlaybackActive ? undefined : onLoad}
      {...attributes}
      {...listeners}
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
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            sx={{ p: 0.25, color: mix.isFavorite ? '#ffd84f' : 'text.disabled' }}
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
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            sx={{ p: 0.25, color: 'primary.main' }}
          >
            <AddIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};
