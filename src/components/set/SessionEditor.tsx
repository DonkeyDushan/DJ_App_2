import type { DragEndEvent } from '@dnd-kit/core';
import { Box, Button, InputBase, Typography } from '@mui/material';

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
}

export const SessionEditor = ({
  activeSession,
  sessions,
  mixes,
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
}: SessionEditorProps): React.ReactElement => {
  const totalMinutes = Math.round(activeSession.totalDurationSeconds / 60);

  return (
    <Box sx={editorRootSx}>
      {/* Controls row */}
      <Box sx={controlsRowSx}>
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
              if (!Number.isNaN(val) && val > 0) {
                onSetTotalDuration(val * 60);
              }
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
        onDragEnd={onTimelineDragEnd}
        onRemoveSlot={onRemoveSlot}
        onDuplicateSlot={onDuplicateSlot}
        onSetSlotDuration={onSetSlotDuration}
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
