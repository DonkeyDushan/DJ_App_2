import { memo } from 'react';
import { Plus } from 'pixelarticons/react/Plus';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { DJSet } from '../../../../core/types/setData';
import { SetLibraryCard } from '../SetLibraryCard/SetLibraryCard';
import { PixelIcon } from '../../../../components';
import {
  emptyLabelSx,
  headerLabelSx,
  headerRowSx,
  listSx,
  listWrapperSx,
  panelSx,
} from './SetLibrary.styles';

interface SetLibraryProps {
  sets: DJSet[];
  activeSetId: string;
  isSetPlaybackActive: boolean;
  onLoad: (setId: string) => void;
  onDelete: (setId: string) => void;
  onRename: (setId: string) => void;
  onNewSet: () => void;
}

const SetLibraryInner = ({
  sets,
  activeSetId,
  isSetPlaybackActive,
  onLoad,
  onDelete,
  onRename,
  onNewSet,
}: SetLibraryProps): React.ReactElement => (
  <Box sx={panelSx} data-testid="set-library">
    <Box sx={headerRowSx}>
      <Typography sx={headerLabelSx}>{STRINGS.set.savedSets}</Typography>

      <Tooltip title={STRINGS.set.newSet}>
        <IconButton
          onClick={onNewSet}
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

    <Box sx={listWrapperSx}>
      <Box sx={listSx}>
        {sets.length === 0 ? (
          <Typography sx={emptyLabelSx}>{STRINGS.set.noSets}</Typography>
        ) : (
          sets.map((set) => (
            <SetLibraryCard
              key={set.id}
              set={set}
              isActive={activeSetId === set.id}
              isSetPlaybackActive={isSetPlaybackActive}
              onLoad={() => onLoad(set.id)}
              onDelete={() => onDelete(set.id)}
              onRename={() => onRename(set.id)}
            />
          ))
        )}
      </Box>
    </Box>
  </Box>
);

export const SetLibrary = memo(SetLibraryInner);
SetLibrary.displayName = 'SetLibrary';
