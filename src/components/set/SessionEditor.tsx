import type { DragEndEvent } from '@dnd-kit/core';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, Button, IconButton, InputBase, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../strings';
import type { DJSession, SavedMix } from '../../types';
import { SessionList } from './SessionList';
import { SessionTimeline } from './SessionTimeline';
import {
  controlsRowSx,
  durationInputSx,
  durationLabelSx,
  editorRootSx,
  nameInputSx,
} from './SessionEditor.styles';

interface SessionEditorProps {
  activeSession: DJSession;
  sessions: DJSession[];
  mixes: SavedMix[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onNewSession: () => void;
  onSaveSession: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onToggleSessionFavorite: (id: string) => void;
  onSetSessionName: (name: string) => void;
  onRemoveSlot: (slotId: string) => void;
  onDuplicateSlot: (slotId: string) => void;
  onSetSlotDuration: (slotId: string, durationSeconds: number) => void;
  onSetTotalDuration: (seconds: number) => void;
  onTimelineDragEnd: (event: DragEndEvent) => void;
  playheadSeconds: number;
  onSeek: (seconds: number) => void;
}

export const SessionEditor = ({
  activeSession,
  sessions,
  mixes,
  isPlaying,
  onPlayPause,
  onNewSession,
  onSaveSession,
  onLoadSession,
  onDeleteSession,
  onToggleSessionFavorite,
  onSetSessionName,
  onRemoveSlot,
  onDuplicateSlot,
  onSetSlotDuration,
  onSetTotalDuration,
  onTimelineDragEnd,
  playheadSeconds,
  onSeek,
}: SessionEditorProps): React.ReactElement => {
  const totalMinutes = Math.round(activeSession.totalDurationSeconds / 60);
  const hasSlots = activeSession.slots.length > 0;

  return (
    <Box sx={editorRootSx}>
      {/* Controls row */}
      <Box sx={controlsRowSx}>
        <Tooltip title={isPlaying ? 'Stop' : hasSlots ? 'Play set' : 'Add mixes first'}>
          <span>
            <IconButton
              onClick={onPlayPause}
              disabled={!hasSlots && !isPlaying}
              sx={{
                color: isPlaying ? 'warning.main' : 'success.main',
                bgcolor: isPlaying
                  ? 'rgba(255,143,79,0.12)'
                  : 'rgba(108,255,159,0.1)',
                border: '1px solid',
                borderColor: isPlaying ? 'warning.main' : 'success.main',
                borderRadius: 1,
                p: 0.5,
                '&:hover': {
                  bgcolor: isPlaying
                    ? 'rgba(255,143,79,0.22)'
                    : 'rgba(108,255,159,0.2)',
                },
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              {isPlaying ? (
                <PauseIcon sx={{ fontSize: 18 }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>

        <InputBase
          value={activeSession.name}
          onChange={(e) => onSetSessionName(e.target.value)}
          placeholder={STRINGS.set.sessionNamePlaceholder}
          sx={nameInputSx}
          inputProps={{ spellCheck: false }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={durationLabelSx}>{STRINGS.set.totalDuration}</Typography>
          <InputBase
            value={totalMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!Number.isNaN(val) && val > 0) onSetTotalDuration(val * 60);
            }}
            type="number"
            inputProps={{ min: 1, max: 180 }}
            sx={durationInputSx}
          />
          <Typography sx={durationLabelSx}>{STRINGS.set.minutes}</Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={onNewSession}
          sx={{ py: 0.25, px: 1, fontSize: '0.6rem', minWidth: 0 }}
        >
          {STRINGS.set.newSession}
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onSaveSession}
          sx={{ py: 0.25, px: 1, fontSize: '0.6rem', minWidth: 0 }}
        >
          {STRINGS.set.saveSession}
        </Button>
      </Box>

      {/* Timeline snake */}
      <SessionTimeline
        session={activeSession}
        mixes={mixes}
        isPlaying={isPlaying}
        playheadSeconds={playheadSeconds}
        onDragEnd={onTimelineDragEnd}
        onRemoveSlot={onRemoveSlot}
        onDuplicateSlot={onDuplicateSlot}
        onSetSlotDuration={onSetSlotDuration}
        onSeek={onSeek}
      />

      {/* Saved sessions */}
      <SessionList
        sessions={sessions}
        onLoad={onLoadSession}
        onDelete={onDeleteSession}
        onToggleFavorite={onToggleSessionFavorite}
      />
    </Box>
  );
};
