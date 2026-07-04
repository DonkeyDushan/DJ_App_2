import { memo } from 'react';
import { Plus } from 'pixelarticons/react/Plus';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { DJSet } from '../../../../core/types/setData';
import { SetLibraryCard } from '../SetLibraryCard/SetLibraryCard';
import { UnsavedSetCard } from '../UnsavedSetCard/UnsavedSetCard';
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
  showUnsavedCard: boolean;
  unsavedSlotCount: number;
  unsavedDurationSeconds: number;
  onLoad: (setId: string) => void;
  onDelete: (setId: string) => void;
  onRename: (setId: string) => void;
  onNewSet: () => void;
  onSaveUnsavedSet: () => void;
}

const SetLibraryInner = ({
  sets,
  activeSetId,
  showUnsavedCard,
  unsavedSlotCount,
  unsavedDurationSeconds,
  onLoad,
  onDelete,
  onRename,
  onNewSet,
  onSaveUnsavedSet,
}: SetLibraryProps): React.ReactElement => (
  <Box sx={panelSx} data-testid="set-library">
    <Box sx={headerRowSx}>
      <Typography sx={headerLabelSx}>{STRINGS.set.savedSets}</Typography>

      <Tooltip title={STRINGS.set.newSet}>
        <IconButton
          onClick={onNewSet}
          size="small"
          data-testid="set-new-button"
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
        {showUnsavedCard && (
          <UnsavedSetCard
            slotCount={unsavedSlotCount}
            durationSeconds={unsavedDurationSeconds}
            onSave={onSaveUnsavedSet}
          />
        )}

        {sets.length === 0 ? (
          <Typography sx={emptyLabelSx}>{STRINGS.set.noSets}</Typography>
        ) : (
          sets.map((set) => (
            <SetLibraryCard
              key={set.id}
              set={set}
              isActive={activeSetId === set.id}
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
