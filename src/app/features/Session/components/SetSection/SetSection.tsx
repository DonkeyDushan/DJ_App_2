import { memo, useEffect, useRef, useState } from 'react';
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Reload } from 'pixelarticons/react/Reload';
import { Save } from 'pixelarticons/react/Save';
import {
  Box,
  IconButton,
  InputBase,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';

import { STRINGS } from '../../../../strings';
import { PixelIcon, PlayButton } from '../../../../components';
import type { DJSession } from '../../../../core/types/sessionData';
import type { TransitionKind } from '../../../../core/types/transition';
import type { SavedMix } from '../../../../core/types/mixData';
import { SessionNameInput } from '../SessionNameInput/SessionNameInput';
import { SessionTimeline } from '../SessionTimeline/SessionTimeline';
import {
  TRANSITION_KIND_LABEL,
  TransitionEditor,
} from '../TransitionEditor/TransitionEditor';
import {
  defaultTransitionButtonSx,
  durationInputSx,
  durationLabelSx,
  headerRootSx,
  nameInputSx,
  rootSx,
} from './SetSection.styles';

interface SetSectionProps {
  activeSession: DJSession;
  mixes: SavedMix[];
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
  onSetSlotTransitionKind: (slotId: string, kind: TransitionKind) => void;
  onSetSlotTransitionDuration: (
    slotId: string,
    durationSeconds: number,
  ) => void;
  onSetDefaultTransition: (
    kind: TransitionKind,
    durationSeconds: number,
  ) => void;
  onReorderSlots: (slots: DJSession['slots']) => void;
  onSeekSlot?: (seconds: number) => void;
}

const SetSectionInner = ({
  activeSession,
  mixes,
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
  onSetSlotTransitionKind,
  onSetSlotTransitionDuration,
  onSetDefaultTransition,
  onReorderSlots,
  onSeekSlot,
}: SetSectionProps): React.ReactElement => {
  const [playheadSeconds, setPlayheadSeconds] = useState(0);
  const [defaultAnchor, setDefaultAnchor] = useState<HTMLElement | null>(null);
  const prevSessionIdRef = useRef(activeSession.id);

  useEffect(() => {
    if (prevSessionIdRef.current !== activeSession.id) {
      prevSessionIdRef.current = activeSession.id;
      setPlayheadSeconds(0);
    }
  }, [activeSession.id]);

  // When the set is fully stopped (end of set, not paused) the playback
  // position is cleared, so snap the visual playhead back to the start. This
  // keeps a subsequent fresh start aligned with the audio, which also restarts
  // from zero. Pausing keeps currentSlotIndex non-null and does not reset here.
  useEffect(() => {
    if (currentSlotIndex === null) {
      setPlayheadSeconds(0);
    }
  }, [currentSlotIndex]);

  const totalMinutes = Math.round(activeSession.totalDurationSeconds / 60);
  const hasSlots = activeSession.slots.length > 0;

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
        <Box sx={headerRootSx}>
          <PlayButton
            isPlaying={isSetPlaying}
            onToggleTransport={onPlayPause}
            disabled={!hasSlots}
          />

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
                fontFamily: 'Mozilla Headline, monospace',
                fontSize: '1rem',
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
            <Tooltip title={STRINGS.set.setDefaultTransition}>
              <Box
                component="button"
                type="button"
                onClick={(e) => setDefaultAnchor(e.currentTarget)}
                sx={defaultTransitionButtonSx}
                data-testid="set-default-transition"
              >
                ↗{' '}
                {TRANSITION_KIND_LABEL[activeSession.defaultTransitionKind]}
              </Box>
            </Tooltip>

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
            <Tooltip title={STRINGS.topBar.resetSet}>
              <IconButton
                onClick={onResetSet}
                disabled={isSetPlaying || !hasUnsavedChanges}
                size="small"
              >
                <PixelIcon glyph={Reload} />
              </IconButton>
            </Tooltip>
            <Tooltip title={STRINGS.topBar.saveSet}>
              <IconButton
                onClick={onSaveSet}
                disabled={isSetPlaying}
                size="small"
                sx={{
                  color: 'pink.main',
                  '&:hover': {
                    color: 'pink.light',
                  },
                }}
              >
                <PixelIcon glyph={Save} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Popover
          open={Boolean(defaultAnchor)}
          anchorEl={defaultAnchor}
          onClose={() => setDefaultAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <TransitionEditor
            kind={activeSession.defaultTransitionKind}
            durationSeconds={activeSession.defaultTransitionDuration}
            onChangeKind={(kind) =>
              onSetDefaultTransition(
                kind,
                activeSession.defaultTransitionDuration,
              )
            }
            onChangeDuration={(durationSeconds) =>
              onSetDefaultTransition(
                activeSession.defaultTransitionKind,
                durationSeconds,
              )
            }
          />
        </Popover>

        <SessionTimeline
          session={activeSession}
          mixes={mixes}
          isPlaying={isSetPlaying}
          playheadSeconds={playheadSeconds}
          onDragEnd={handleDragEnd}
          onRemoveSlot={onRemoveSlot}
          onDuplicateSlot={onDuplicateSlot}
          onSetSlotDuration={onSetSlotDuration}
          onSetSlotTransitionKind={onSetSlotTransitionKind}
          onSetSlotTransitionDuration={onSetSlotTransitionDuration}
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
