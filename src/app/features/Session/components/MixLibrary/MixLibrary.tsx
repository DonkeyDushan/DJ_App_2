import { memo } from 'react';
import { Plus } from 'pixelarticons/react/Plus';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { SavedMix } from '../../../../core/types/mixData';
import { MixLibraryCard } from '../MixLibraryCard/MixLibraryCard';
import { PixelIcon } from '../../../../components';
import {
  emptyLabelSx,
  headerRowSx,
  listSx,
  panelSx,
} from './MixLibrary.styles';
import { headerLabelSx } from '../SetLibrary/SetLibrary.styles';

interface MixLibraryProps {
  mixes: SavedMix[];
  activeMixId: string | null;
  playingMixId: string | null;
  isSetPlaybackActive: boolean;
  onAddToTimeline: (mixId: string) => void;
  onLoadMix: (mixId: string) => void;
  onNewMix: () => void;
  onEditMix: (mixId: string) => void;
}

const MixLibraryInner = ({
  mixes,
  activeMixId,
  playingMixId,
  isSetPlaybackActive,
  onAddToTimeline,
  onLoadMix,
  onNewMix,
  onEditMix,
}: MixLibraryProps): React.ReactElement => (
  <Box sx={panelSx} data-testid="mix-library">
    <Box sx={headerRowSx}>
      <Typography sx={headerLabelSx}>{STRINGS.set.mixLibrary}</Typography>

      <Tooltip title={STRINGS.mixLibrary.newMix}>
        <IconButton
          onClick={onNewMix}
          size="small"
          sx={{
            color: 'pink.main',
            '&:hover': {
              color: 'pink.light',
            },
          }}
        >
          <PixelIcon glyph={Plus} />
        </IconButton>
      </Tooltip>
    </Box>

    <Box sx={listSx}>
      {mixes.length === 0 ? (
        <Typography sx={emptyLabelSx}>{STRINGS.set.noMixes}</Typography>
      ) : (
        mixes.map((mix) => (
          <MixLibraryCard
            key={mix.id}
            mix={mix}
            isActive={activeMixId === mix.id}
            isSetPlaying={playingMixId === mix.id}
            isSetPlaybackActive={isSetPlaybackActive}
            onAdd={() => onAddToTimeline(mix.id)}
            onLoad={() => onLoadMix(mix.id)}
            onEdit={() => onEditMix(mix.id)}
          />
        ))
      )}
    </Box>
  </Box>
);

export const MixLibrary = memo(MixLibraryInner);
MixLibrary.displayName = 'MixLibrary';
