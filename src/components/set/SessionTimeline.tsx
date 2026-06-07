import { useCallback, useRef } from 'react';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';

import { STRINGS } from '../../strings';
import type { DJSession, SavedMix } from '../../types';
import { SessionSlotBlock } from './SessionSlotBlock';
import {
  emptyLabelSx,
  emptyTimelineSx,
  rulerSx,
  slotsRowSx,
  tickLabelSx,
  timelineWrapperSx,
} from './SessionTimeline.styles';
import { RULER_TICK_MINUTES, getSlotColor } from './timelineConstants';

export const TIMELINE_DROPPABLE_ID = 'timeline';

interface SessionTimelineProps {
  session: DJSession;
  mixes: SavedMix[];
  onDragEnd: (event: DragEndEvent) => void;
  onRemoveSlot: (slotId: string) => void;
  onDuplicateSlot: (slotId: string) => void;
  onSetSlotDuration: (slotId: string, durationSeconds: number) => void;
}

export const SessionTimeline = ({
  session,
  mixes,
  onDragEnd: _onDragEnd,
  onRemoveSlot,
  onDuplicateSlot,
  onSetSlotDuration,
}: SessionTimelineProps): React.ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOver, setNodeRef } = useDroppable({ id: TIMELINE_DROPPABLE_ID });

  const slotTotalSeconds = session.slots.reduce(
    (sum, s) => sum + s.durationSeconds,
    0,
  );
  const effectiveTotal = Math.max(session.totalDurationSeconds, slotTotalSeconds, 1);

  const tickCount = Math.ceil(effectiveTotal / 60 / RULER_TICK_MINUTES);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * RULER_TICK_MINUTES);

  const slotIds = session.slots.map((s) => s.id);

  const getResizeFactor = useCallback(() => {
    const width = containerRef.current?.offsetWidth ?? 1;
    return width / effectiveTotal;
  }, [effectiveTotal]);

  const setRefs = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    setNodeRef(el);
  };

  return (
    <Box sx={timelineWrapperSx}>
      {/* Time ruler */}
      <Box sx={rulerSx}>
        {ticks.map((min) => (
          <Box
            key={min}
            sx={{
              position: 'absolute',
              left: `${(min * 60 / effectiveTotal) * 100}%`,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              pl: '3px',
            }}
          >
            <Typography sx={tickLabelSx}>{min === 0 ? '0' : `${min}m`}</Typography>
          </Box>
        ))}
      </Box>

      {/* Slots row */}
      <Box ref={setRefs} sx={slotsRowSx(isOver)}>
        {session.slots.length === 0 ? (
          <Box sx={emptyTimelineSx}>
            <Typography sx={emptyLabelSx}>{STRINGS.set.noSlots}</Typography>
          </Box>
        ) : (
          <SortableContext items={slotIds} strategy={horizontalListSortingStrategy}>
            {session.slots.map((slot) => {
              const widthPercent = (slot.durationSeconds / effectiveTotal) * 100;
              return (
                <SessionSlotBlock
                  key={slot.id}
                  slot={slot}
                  mix={mixes.find((m) => m.id === slot.mixId)}
                  color={getSlotColor(slot.mixId)}
                  widthPercent={widthPercent}
                  getResizeFactor={getResizeFactor}
                  onRemove={() => onRemoveSlot(slot.id)}
                  onDuplicate={() => onDuplicateSlot(slot.id)}
                  onResizeDuration={(d) => onSetSlotDuration(slot.id, d)}
                />
              );
            })}
          </SortableContext>
        )}
      </Box>
    </Box>
  );
};

export { arrayMove };
