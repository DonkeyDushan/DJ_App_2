import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { DJSession } from '../../../../core/types/sessionData';
import { formatSlotDuration } from '../../utils/timelineFormatters';
import {
  emptyLabelSx,
  listSx,
  sectionHeaderSx,
  sessionMetaSx,
  sessionNameSx,
  sessionRowSx,
} from './SessionList.styles';

interface SessionListProps {
  sessions: DJSession[];
  onLoad: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onToggleFavorite: (sessionId: string) => void;
}

const getTotalDuration = (session: DJSession): number =>
  session.slots.reduce((sum, s) => sum + s.durationSeconds, 0);

export const SessionList = ({
  sessions,
  onLoad,
  onDelete,
  onToggleFavorite,
}: SessionListProps): React.ReactElement => (
  <>
    <Typography sx={sectionHeaderSx}>{STRINGS.set.savedSessions}</Typography>
    <Box sx={listSx} data-testid="session-list">
      {sessions.length === 0 ? (
        <Typography sx={emptyLabelSx}>{STRINGS.set.noSessions}</Typography>
      ) : (
        sessions.map((session) => (
          <Box
            key={session.id}
            sx={sessionRowSx(session.isFavorite)}
            data-testid={`session-row--${session.id}`}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={sessionNameSx}>{session.name}</Typography>
              <Typography sx={sessionMetaSx}>
                {session.slots.length} slots ·{' '}
                {formatSlotDuration(getTotalDuration(session))}
              </Typography>
            </Box>

            <Tooltip
              title={
                session.isFavorite
                  ? STRINGS.set.removeFromFavourites
                  : STRINGS.set.addToFavourites
              }
            >
              <IconButton
                size="small"
                onClick={() => onToggleFavorite(session.id)}
                data-testid={`session-favorite--${session.id}`}
                sx={{
                  p: 0.25,
                  color: session.isFavorite ? '#ffd84f' : 'text.disabled',
                }}
              >
                {session.isFavorite ? (
                  <StarIcon sx={{ fontSize: 14 }} />
                ) : (
                  <StarBorderIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title={STRINGS.set.loadSession}>
              <IconButton
                size="small"
                onClick={() => onLoad(session.id)}
                data-testid={`session-load--${session.id}`}
                sx={{ p: 0.25, color: 'secondary.main' }}
              >
                <PlaylistAddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title={STRINGS.set.deleteSession}>
              <IconButton
                size="small"
                onClick={() => onDelete(session.id)}
                data-testid={`session-delete--${session.id}`}
                sx={{ p: 0.25, color: 'text.disabled' }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ))
      )}
    </Box>
  </>
);
