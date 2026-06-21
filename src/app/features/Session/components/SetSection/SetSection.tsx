import { memo, useEffect, useRef, useState } from 'react';
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Tooltip,
  Typography,
} from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { DJSession } from '../../../../core/types/sessionData';
import type { SavedMix } from '../../../../core/types/mixData';
import type { TrackDefinition } from '../../../../core/types/trackData';
import { SessionNameInput } from '../SessionNameInput/SessionNameInput';
import { SessionTimeline } from '../SessionTimeline/SessionTimeline';
import {
  controlsRowSx,
  durationInputSx,
  durationLabelSx,
  nameInputSx,
  rootSx,
} from './SetSection.styles';

interface SetSectionProps {
  activeSession: DJSession;
  mixes: SavedMix[];
  tracks: TrackDefinition[];
  isSetPlaying: boolean;
  currentSlotIndex: number | null;
  hasUnsavedChanges: boolean;
  onPlayPause: () => void;
  onSaveSet: () => void;
  onResetSet: () => void;
  onSetSessionName: (name: string) => void;
  onSetTotalDuration: (seconds: number) => void;
  onRemoveSlot: (slotId: string) => void;
  onDuplicateSlot: (slotId: string) => void;
  onSetSlotDuration: (slotId: string, durationSeconds: number) => void;
  onReorderSlots: (slots: DJSession['slots']) => void;
  onSeekSlot?: (seconds: number) => void;
}

const SetSectionInner = ({
  activeSession,
  mixes,
  tracks,
  isSetPlaying,
  currentSlotIndex,
  hasUnsavedChanges,
  onPlayPause,
  onSaveSet,
  onResetSet,
  onSetSessionName,
  onSetTotalDuration,
  onRemoveSlot,
  onDuplicateSlot,
  onSetSlotDuration,
  onReorderSlots,
  onSeekSlot,
}: SetSectionProps): React.ReactElement => {
  const [playheadSeconds, setPlayheadSeconds] = useState(0);
  const prevSessionIdRef = useRef(activeSession.id);

  useEffect(() => {
    if (prevSessionIdRef.current !== activeSession.id) {
      prevSessionIdRef.current = activeSession.id;
      setPlayheadSeconds(0);
    }
  }, [activeSession.id]);

  const totalMinutes = Math.round(activeSession.totalDurationSeconds / 60);
  const hasSlots = activeSession.slots.length > 0;

  let playPauseTooltipTitle: string = STRINGS.set.noSlots;
  if (isSetPlaying) {
    playPauseTooltipTitle = STRINGS.setSection.stopSet;
  } else if (hasSlots) {
    playPauseTooltipTitle = STRINGS.setSection.playSet;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const type = active.data.current?.type as string | undefined;

    if (type === 'slot') {
      if (active.id !== over.id) {
        const oldIdx = activeSession.slots.findIndex((s) => s.id === active.id);
        const newIdx = activeSession.slots.findIndex((s) => s.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
          onReorderSlots(arrayMove(activeSession.slots, oldIdx, newIdx));
        }
      }
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Box sx={rootSx} data-testid="set-section">
        <Box sx={controlsRowSx}>
          <Tooltip title={playPauseTooltipTitle}>
            <span>
              <IconButton
                onClick={onPlayPause}
                disabled={!hasSlots && !isSetPlaying}
                data-testid="set-play-pause"
                sx={{
                  color: isSetPlaying ? 'warning.main' : 'success.main',
                  bgcolor: isSetPlaying
                    ? 'rgba(255,143,79,0.12)'
                    : 'rgba(108,255,159,0.1)',
                  border: '1px solid',
                  borderColor: isSetPlaying ? 'warning.main' : 'success.main',
                  borderRadius: 1,
                  p: 0.5,
                  '&:hover': {
                    bgcolor: isSetPlaying
                      ? 'rgba(255,143,79,0.22)'
                      : 'rgba(108,255,159,0.2)',
                  },
                  '&.Mui-disabled': { opacity: 0.3 },
                }}
              >
                {isSetPlaying ? (
                  <PauseIcon sx={{ fontSize: 18 }} />
                ) : (
                  <PlayArrowIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <SessionNameInput
            key={activeSession.id}
            initialName={activeSession.name}
            onCommit={onSetSessionName}
            placeholder={STRINGS.set.sessionNamePlaceholder}
            sx={nameInputSx}
          />

          {isSetPlaying && currentSlotIndex !== null && (
            <Typography
              sx={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '0.6rem',
                color: 'success.main',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {currentSlotIndex + 1} / {activeSession.slots.length}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              ml: 'auto',
            }}
          >
            <Tooltip title={STRINGS.topBar.resetSet}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    <RestartAltIcon sx={{ fontSize: '0.75rem !important' }} />
                  }
                  onClick={onResetSet}
                  disabled={isSetPlaying || !hasUnsavedChanges}
                  data-testid="set-reset"
                  sx={{
                    py: 0.25,
                    px: 1.25,
                    fontSize: '0.6rem',
                    fontFamily: 'Orbitron, monospace',
                    letterSpacing: '0.08em',
                    color: 'warning.main',
                    borderColor: 'warning.main',
                    '&:hover': {
                      borderColor: 'warning.light',
                      bgcolor: 'rgba(255,143,79,0.08)',
                    },
                    '&.Mui-disabled': { opacity: 0.3 },
                  }}
                >
                  {STRINGS.topBar.resetSet}
                </Button>
              </span>
            </Tooltip>

            <Button
              size="small"
              variant="contained"
              startIcon={<SaveIcon sx={{ fontSize: '0.75rem !important' }} />}
              onClick={onSaveSet}
              disabled={isSetPlaying}
              data-testid="set-save"
              sx={{
                py: 0.25,
                px: 1.25,
                fontSize: '0.6rem',
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.08em',
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              {STRINGS.topBar.saveSet}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={durationLabelSx}>
                {STRINGS.set.totalDuration}
              </Typography>
              <InputBase
                value={totalMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!Number.isNaN(val) && val > 0)
                    onSetTotalDuration(val * 60);
                }}
                type="number"
                inputProps={{ min: 1, max: 180 }}
                sx={durationInputSx}
              />
              <Typography sx={durationLabelSx}>
                {STRINGS.set.minutes}
              </Typography>
            </Box>
          </Box>
        </Box>

        <SessionTimeline
          session={activeSession}
          mixes={mixes}
          tracks={tracks}
          isPlaying={isSetPlaying}
          playheadSeconds={playheadSeconds}
          onDragEnd={handleDragEnd}
          onRemoveSlot={onRemoveSlot}
          onDuplicateSlot={onDuplicateSlot}
          onSetSlotDuration={onSetSlotDuration}
          onSeek={(seconds) => {
            setPlayheadSeconds(seconds);
            onSeekSlot?.(seconds);
          }}
        />
      </Box>
    </DndContext>
  );
};

export const SetSection = memo(SetSectionInner);
SetSection.displayName = 'SetSection';
