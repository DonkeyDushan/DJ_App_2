import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../strings';
import type { DJSession } from '../../types';
import {
  emptyLabelSx,
  listSx,
  sectionHeaderSx,
  sessionMetaSx,
  sessionNameSx,
  sessionRowSx,
} from './SessionList.styles';
import { formatSlotDuration } from './timelineConstants';

interface SessionListProps {
  sessions: DJSession[];
  onLoad: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onToggleFavorite: (sessionId: string) => void;
}

export const SessionList = ({
  sessions,
  onLoad,
  onDelete,
  onToggleFavorite,
}: SessionListProps): React.ReactElement => {
  const totalDuration = (session: DJSession) =>
    session.slots.reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <>
      <Typography sx={sectionHeaderSx}>{STRINGS.set.savedSessions}</Typography>
      <Box sx={listSx}>
        {sessions.length === 0 ? (
          <Typography sx={emptyLabelSx}>{STRINGS.set.noSessions}</Typography>
        ) : (
          sessions.map((session) => (
            <Box key={session.id} sx={sessionRowSx(session.isFavorite)}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={sessionNameSx}>{session.name}</Typography>
                <Typography sx={sessionMetaSx}>
                  {session.slots.length} slots ·{' '}
                  {formatSlotDuration(totalDuration(session))}
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
                  sx={{ p: 0.25, color: 'success.main' }}
                >
                  <PlayArrowIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title={STRINGS.set.deleteSession}>
                <IconButton
                  size="small"
                  onClick={() => onDelete(session.id)}
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
};
