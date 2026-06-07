import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { STRINGS } from '../../strings';
import type { SavedMix } from '../../types';
import { MixLibraryCard } from './MixLibraryCard';
import {
  emptyLabelSx,
  filterRowSx,
  headerRowSx,
  listSx,
  newMixButtonSx,
  panelSx,
} from './MixLibrary.styles';

interface MixLibraryProps {
  mixes: SavedMix[];
  activeMixId: string | null;
  playingMixId: string | null;
  isSetPlaybackActive: boolean;
  onToggleFavorite: (mixId: string) => void;
  onAddToTimeline: (mixId: string) => void;
  onLoadMix: (mixId: string) => void;
  onNewMix: () => void;
}

export const MixLibrary = ({
  mixes,
  activeMixId,
  playingMixId,
  isSetPlaybackActive,
  onToggleFavorite,
  onAddToTimeline,
  onLoadMix,
  onNewMix,
}: MixLibraryProps): React.ReactElement => {
  const [filter, setFilter] = useState<'all' | 'favourites'>('all');

  const visible =
    filter === 'favourites' ? mixes.filter((m) => m.isFavorite) : mixes;

  return (
    <Box sx={panelSx}>
      <Box sx={headerRowSx}>
        <Typography
          sx={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'text.secondary',
          }}
        >
          {STRINGS.set.mixLibrary}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon sx={{ fontSize: '0.7rem !important' }} />}
          onClick={onNewMix}
          sx={newMixButtonSx}
        >
          {STRINGS.mixLibrary.newMix}
        </Button>
      </Box>

      <Box sx={filterRowSx}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => { if (v) setFilter(v as 'all' | 'favourites'); }}
          size="small"
          sx={{ '& .MuiToggleButton-root': { py: 0.25, px: 1, fontSize: '0.6rem' } }}
        >
          <ToggleButton value="all">{STRINGS.set.allMixes}</ToggleButton>
          <ToggleButton value="favourites">
            ★ {STRINGS.set.favouritesOnly}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={listSx}>
        {visible.length === 0 ? (
          <Typography sx={emptyLabelSx}>{STRINGS.set.noMixes}</Typography>
        ) : (
          visible.map((mix) => (
            <MixLibraryCard
              key={mix.id}
              mix={mix}
              isActive={activeMixId === mix.id}
              isSetPlaying={playingMixId === mix.id}
              isSetPlaybackActive={isSetPlaybackActive}
              onToggleFavorite={() => onToggleFavorite(mix.id)}
              onAdd={() => onAddToTimeline(mix.id)}
              onLoad={() => onLoadMix(mix.id)}
            />
          ))
        )}
      </Box>
    </Box>
  );
};
