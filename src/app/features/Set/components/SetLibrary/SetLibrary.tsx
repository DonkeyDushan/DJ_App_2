import { memo } from 'react';
import { Plus } from 'pixelarticons/react/Plus';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { DJSession } from '../../../../core/types/sessionData';
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
  sessions: DJSession[];
  activeSessionId: string;
  isSetPlaybackActive: boolean;
  onLoad: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onRename: (sessionId: string) => void;
  onNewSet: () => void;
}

const SetLibraryInner = ({
  sessions,
  activeSessionId,
  isSetPlaybackActive,
  onLoad,
  onDelete,
  onRename,
  onNewSet,
}: SetLibraryProps): React.ReactElement => (
  <Box sx={panelSx} data-testid="set-library">
    <Box sx={headerRowSx}>
      <Typography sx={headerLabelSx}>{STRINGS.set.savedSessions}</Typography>

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
        {sessions.length === 0 ? (
          <Typography sx={emptyLabelSx}>{STRINGS.set.noSessions}</Typography>
        ) : (
          sessions.map((session) => (
            <SetLibraryCard
              key={session.id}
              session={session}
              isActive={activeSessionId === session.id}
              isSetPlaybackActive={isSetPlaybackActive}
              onLoad={() => onLoad(session.id)}
              onDelete={() => onDelete(session.id)}
              onRename={() => onRename(session.id)}
            />
          ))
        )}
      </Box>
    </Box>
  </Box>
);

export const SetLibrary = memo(SetLibraryInner);
SetLibrary.displayName = 'SetLibrary';
