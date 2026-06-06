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
import {
  PX_PER_SECOND,
  RULER_TICK_MINUTES,
  getSlotColor,
} from './timelineConstants';

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
  const { isOver, setNodeRef } = useDroppable({ id: TIMELINE_DROPPABLE_ID });

  const totalSlotSeconds = session.slots.reduce(
    (sum, s) => sum + s.durationSeconds,
    0,
  );
  const totalWidth = Math.max(
    session.totalDurationSeconds * PX_PER_SECOND,
    totalSlotSeconds * PX_PER_SECOND,
    320,
  );

  const tickCount = Math.ceil(session.totalDurationSeconds / 60 / RULER_TICK_MINUTES);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * RULER_TICK_MINUTES);

  const slotIds = session.slots.map((s) => s.id);

  return (
    <Box sx={timelineWrapperSx}>
      {/* Time ruler */}
      <Box sx={rulerSx(totalWidth)}>
        {ticks.map((min) => (
          <Box
            key={min}
            sx={{
              position: 'absolute',
              left: min * 60 * PX_PER_SECOND,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              pl: '3px',
            }}
          >
            <Typography sx={tickLabelSx}>
              {min === 0 ? '0' : `${min}m`}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Slots row */}
      <Box ref={setNodeRef} sx={slotsRowSx(totalWidth, isOver)}>
        {session.slots.length === 0 ? (
          <Box sx={emptyTimelineSx}>
            <Typography sx={emptyLabelSx}>
              {STRINGS.set.noSlots}
            </Typography>
          </Box>
        ) : (
          <SortableContext
            items={slotIds}
            strategy={horizontalListSortingStrategy}
          >
            {session.slots.map((slot) => (
              <SessionSlotBlock
                key={slot.id}
                slot={slot}
                mix={mixes.find((m) => m.id === slot.mixId)}
                color={getSlotColor(slot.mixId)}
                onRemove={() => onRemoveSlot(slot.id)}
                onDuplicate={() => onDuplicateSlot(slot.id)}
                onResizeDuration={(d) => onSetSlotDuration(slot.id, d)}
              />
            ))}
          </SortableContext>
        )}
      </Box>
    </Box>
  );
};

export { arrayMove };
