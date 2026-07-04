import { memo, useEffect, useRef, useState } from 'react';
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Download } from 'pixelarticons/react/Download';
import { Delete } from 'pixelarticons/react/Delete';
import { Save } from 'pixelarticons/react/Save';
import { Waves } from 'pixelarticons/react/Waves';
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
import type { DJSet } from '../../../../core/types/setData';
import type { TransitionKind } from '../../../../core/types/transition';
import type { SavedMix } from '../../../../core/types/mixData';
import { SetNameInput } from '../SetNameInput/SetNameInput';
import { SetTimeline } from '../SetTimeline/SetTimeline';
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
  activeSet: DJSet;
  mixes: SavedMix[];
  isSetPlaying: boolean;
  currentSlotIndex: number | null;
  hasUnsavedChanges: boolean;
  isExporting: boolean;
  onPlayPause: () => void;
  onSaveSet: () => void;
  onResetSet: () => void;
  onExportSet: () => void;
  onUpdateSetName: (name: string) => void;
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
  onReorderSlots: (slots: DJSet['slots']) => void;
  onSeekSlot?: (seconds: number) => void;
}

const SetSectionInner = ({
  activeSet,
  mixes,
  isSetPlaying,
  currentSlotIndex,
  hasUnsavedChanges,
  isExporting,
  onPlayPause,
  onSaveSet,
  onResetSet,
  onExportSet,
  onUpdateSetName,
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
  const prevSetIdRef = useRef(activeSet.id);

  useEffect(() => {
    if (prevSetIdRef.current !== activeSet.id) {
      prevSetIdRef.current = activeSet.id;
      setPlayheadSeconds(0);
    }
  }, [activeSet.id]);

  // When the set is fully stopped (end of set, not paused) the playback
  // position is cleared, so snap the visual playhead back to the start. This
  // keeps a subsequent fresh start aligned with the audio, which also restarts
  // from zero. Pausing keeps currentSlotIndex non-null and does not reset here.
  useEffect(() => {
    if (currentSlotIndex === null) {
      setPlayheadSeconds(0);
    }
  }, [currentSlotIndex]);

  const totalMinutes = Math.round(activeSet.totalDurationSeconds / 60);
  const hasSlots = activeSet.slots.length > 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const type = active.data.current?.type as string | undefined;

    if (type === 'slot') {
      if (active.id !== over.id) {
        const oldIdx = activeSet.slots.findIndex((s) => s.id === active.id);
        const newIdx = activeSet.slots.findIndex((s) => s.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
          onReorderSlots(arrayMove(activeSet.slots, oldIdx, newIdx));
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
            testId="set-play"
          />

          <Box
            data-testid="set-name"
            sx={{ display: 'flex', flex: 1, minWidth: 0 }}
          >
            <SetNameInput
              key={activeSet.id}
              initialName={activeSet.name}
              onCommit={onUpdateSetName}
              placeholder={STRINGS.set.setNamePlaceholder}
              sx={nameInputSx}
            />
          </Box>

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
              {currentSlotIndex + 1} / {activeSet.slots.length}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              ml: 'auto',
            }}
          >
            <Tooltip title={STRINGS.set.setDefaultTransition}>
              <IconButton
                size="small"
                onClick={(e) => setDefaultAnchor(e.currentTarget)}
                sx={defaultTransitionButtonSx}
                data-testid="set-default-transition"
              >
                <PixelIcon glyph={Waves} />
                <Typography>
                  {TRANSITION_KIND_LABEL[activeSet.defaultTransitionKind]}
                  {activeSet.defaultTransitionDuration > 0
                    ? ` ${activeSet.defaultTransitionDuration}s`
                    : ''}
                </Typography>
              </IconButton>
            </Tooltip>

            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              data-testid="set-duration"
            >
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
            <Tooltip title={STRINGS.set.exportAudio}>
              <span>
                <IconButton
                  onClick={onExportSet}
                  disabled={isSetPlaying || isExporting || !hasSlots}
                  size="small"
                  data-testid="set-export"
                >
                  <PixelIcon glyph={Download} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={STRINGS.topBar.resetSet}>
              <IconButton
                onClick={onResetSet}
                disabled={isSetPlaying || !hasUnsavedChanges}
                size="small"
                data-testid="set-reset"
              >
                <PixelIcon glyph={Delete} />
              </IconButton>
            </Tooltip>
            <Tooltip title={STRINGS.topBar.saveSet}>
              <IconButton
                onClick={onSaveSet}
                disabled={isSetPlaying}
                size="small"
                data-testid="set-save"
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
            kind={activeSet.defaultTransitionKind}
            durationSeconds={activeSet.defaultTransitionDuration}
            onChangeKind={(kind) =>
              onSetDefaultTransition(kind, activeSet.defaultTransitionDuration)
            }
            onChangeDuration={(durationSeconds) =>
              onSetDefaultTransition(
                activeSet.defaultTransitionKind,
                durationSeconds,
              )
            }
          />
        </Popover>

        <SetTimeline
          set={activeSet}
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
