import { memo } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { IconButton, Paper, Tooltip, Typography, Box } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { DJSession } from '../../../../core/types/sessionData';
import { formatSlotDuration } from '../../utils/timelineFormatters';
import { cardSx, rowSx, setMetaSx, setNameSx } from './SetLibraryCard.styles';

interface SetLibraryCardProps {
  session: DJSession;
  isActive: boolean;
  isSetPlaybackActive: boolean;
  onLoad: () => void;
  onDelete: () => void;
  onRename: () => void;
}

const getTotalDuration = (session: DJSession): number =>
  session.slots.reduce((sum, s) => sum + s.durationSeconds, 0);

const SetLibraryCardInner = ({
  session,
  isActive,
  isSetPlaybackActive,
  onLoad,
  onDelete,
  onRename,
}: SetLibraryCardProps): React.ReactElement => (
  <Paper
    variant="outlined"
    sx={cardSx(isActive, isSetPlaybackActive)}
    onClick={isSetPlaybackActive ? undefined : onLoad}
    data-testid={`set-library-card--${session.id}`}
  >
    <Box sx={rowSx}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isActive && (
            <GraphicEqIcon sx={{ fontSize: 10, color: 'primary.main' }} />
          )}
          <Typography sx={setNameSx}>{session.name}</Typography>
        </Box>
        <Typography sx={setMetaSx}>
          {session.slots.length} slots · {formatSlotDuration(getTotalDuration(session))}
        </Typography>
      </Box>

      <Tooltip title={STRINGS.set.renameSession}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          sx={{ p: 0.25, color: 'text.disabled' }}
          data-testid={`set-library-rename--${session.id}`}
        >
          <DriveFileRenameOutlineIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title={STRINGS.set.deleteSession}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'error.main' } }}
          data-testid={`set-library-delete--${session.id}`}
        >
          <DeleteIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  </Paper>
);

export const SetLibraryCard = memo(SetLibraryCardInner);
SetLibraryCard.displayName = 'SetLibraryCard';
