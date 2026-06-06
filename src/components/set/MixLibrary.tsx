import { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { STRINGS } from '../../strings';
import type { SavedMix } from '../../types';
import { MixLibraryCard } from './MixLibraryCard';
import {
  emptyLabelSx,
  filterRowSx,
  headerSx,
  listSx,
  panelSx,
} from './MixLibrary.styles';

interface MixLibraryProps {
  mixes: SavedMix[];
  onToggleFavorite: (mixId: string) => void;
  onAddToTimeline: (mixId: string) => void;
}

export const MixLibrary = ({
  mixes,
  onToggleFavorite,
  onAddToTimeline,
}: MixLibraryProps): React.ReactElement => {
  const [filter, setFilter] = useState<'all' | 'favourites'>('all');

  const visible =
    filter === 'favourites' ? mixes.filter((m) => m.isFavorite) : mixes;

  return (
    <Box sx={panelSx}>
      <Typography sx={headerSx}>{STRINGS.set.mixLibrary}</Typography>

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
              onToggleFavorite={() => onToggleFavorite(mix.id)}
              onAdd={() => onAddToTimeline(mix.id)}
            />
          ))
        )}
      </Box>
    </Box>
  );
};
