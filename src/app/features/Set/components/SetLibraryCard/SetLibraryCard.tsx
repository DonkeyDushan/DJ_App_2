import { memo } from 'react';
import { AudioWaveform } from 'pixelarticons/react/AudioWaveform';
import { PenSquare } from 'pixelarticons/react/PenSquare';
import { Trash } from 'pixelarticons/react/Trash';
import { IconButton, Paper, Tooltip, Typography, Box } from '@mui/material';

import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import type { DJSet } from '../../../../core/types/setData';
import { formatSlotDuration } from '../../utils/timelineFormatters';
import {
  actionButtonSx,
  cardSx,
  deleteButtonSx,
  rowSx,
  setMetaSx,
  setNameSx,
} from './SetLibraryCard.styles';

interface SetLibraryCardProps {
  set: DJSet;
  isActive: boolean;
  isSetPlaybackActive: boolean;
  onLoad: () => void;
  onDelete: () => void;
  onRename: () => void;
}

const getTotalDuration = (set: DJSet): number =>
  set.slots.reduce((sum, s) => sum + s.durationSeconds, 0);

const SetLibraryCardInner = ({
  set,
  isActive,
  isSetPlaybackActive,
  onLoad,
  onDelete,
  onRename,
}: SetLibraryCardProps): React.ReactElement => (
  <Paper
    sx={cardSx(isActive)}
    onClick={isSetPlaybackActive ? undefined : onLoad}
    data-testid={`set-library-card--${set.id}`}
  >
    <Box sx={rowSx}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isActive && (
            <Box
              sx={{ display: 'inline-flex', color: 'primary.main', mt: '-4px' }}
            >
              <PixelIcon glyph={AudioWaveform} />
            </Box>
          )}
          <Typography sx={setNameSx}>{set.name}</Typography>
        </Box>
        <Typography sx={setMetaSx}>
          {set.slots.length} slots ·{' '}
          {formatSlotDuration(getTotalDuration(set))}
        </Typography>
      </Box>

      <Tooltip title={STRINGS.set.renameSet}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          sx={actionButtonSx}
          data-set-action
          data-testid={`set-library-rename--${set.id}`}
        >
          <PixelIcon glyph={PenSquare} />
        </IconButton>
      </Tooltip>

      <Tooltip title={STRINGS.set.deleteSet}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={deleteButtonSx}
          data-set-action
          data-testid={`set-library-delete--${set.id}`}
        >
          <PixelIcon glyph={Trash} />
        </IconButton>
      </Tooltip>
    </Box>
  </Paper>
);

export const SetLibraryCard = memo(SetLibraryCardInner);
SetLibraryCard.displayName = 'SetLibraryCard';
