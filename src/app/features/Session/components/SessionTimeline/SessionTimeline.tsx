import { useCallback, useEffect, useRef } from 'react';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { DJSession } from '../../../../core/types/sessionData';
import type { SavedMix } from '../../../../core/types/mixData';
import { SessionSlotBlock } from '../SessionSlotBlock/SessionSlotBlock';
import {
  emptyLabelSx,
  emptyTimelineSx,
  playheadContainerSx,
  playheadHandleSx,
  playheadLineSx,
  rulerSx,
  slotsRowSx,
  tickLabelSx,
  timelineWrapperSx,
} from './SessionTimeline.styles';
import { formatTickLabel, getSlotColor, getTickIntervalSeconds } from '../../utils/timelineFormatters';

export const TIMELINE_DROPPABLE_ID = 'timeline';

interface SessionTimelineProps {
  session: DJSession;
  mixes: SavedMix[];
  isPlaying: boolean;
  playheadSeconds: number;
  onDragEnd: (event: DragEndEvent) => void;
  onRemoveSlot: (slotId: string) => void;
  onDuplicateSlot: (slotId: string) => void;
  onSetSlotDuration: (slotId: string, durationSeconds: number) => void;
  onSeek: (seconds: number) => void;
}

export const SessionTimeline = ({
  session,
  mixes,
  isPlaying,
  playheadSeconds,
  onDragEnd: _onDragEnd,
  onRemoveSlot,
  onDuplicateSlot,
  onSetSlotDuration,
  onSeek,
}: SessionTimelineProps): React.ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const { isOver, setNodeRef } = useDroppable({ id: TIMELINE_DROPPABLE_ID });

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const playheadSecondsRef = useRef(playheadSeconds);
  useEffect(() => { playheadSecondsRef.current = playheadSeconds; }, [playheadSeconds]);

  const onSeekRef = useRef(onSeek);
  useEffect(() => { onSeekRef.current = onSeek; }, [onSeek]);

  const slotTotalSeconds = session.slots.reduce(
    (sum, s) => sum + s.durationSeconds,
    0,
  );
  const effectiveTotal = Math.max(session.totalDurationSeconds, slotTotalSeconds, 1);

  const effectiveTotalRef = useRef(effectiveTotal);
  useEffect(() => { effectiveTotalRef.current = effectiveTotal; }, [effectiveTotal]);

  const animFrameRef = useRef<number>(0);
  const playbackStartRef = useRef<{ wall: number; pos: number } | null>(null);

  const tickIntervalSeconds = getTickIntervalSeconds(effectiveTotal);
  const tickCount = Math.ceil(effectiveTotal / tickIntervalSeconds);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickIntervalSeconds);

  const slotIds = session.slots.map((s) => s.id);

  const getResizeFactor = useCallback(() => {
    const width = containerRef.current?.offsetWidth ?? 1;

    return width / effectiveTotalRef.current;
  }, []);

  const setRefs = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    setNodeRef(el);
  };

  const startTick = useCallback((startPos: number) => {
    cancelAnimationFrame(animFrameRef.current);
    const start = { wall: performance.now(), pos: startPos };
    playbackStartRef.current = start;
    const tick = () => {
      const elapsed = (performance.now() - start.wall) / 1000;
      const pos = start.pos + elapsed;
      if (playheadRef.current) {
        playheadRef.current.style.left = `${Math.min(pos / effectiveTotalRef.current, 1) * 100}%`;
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const seekTo = useCallback((pos: number) => {
    playheadSecondsRef.current = pos;
    if (playheadRef.current) {
      playheadRef.current.style.left = `${(pos / effectiveTotalRef.current) * 100}%`;
    }
    onSeekRef.current(pos);
    if (isPlayingRef.current) {
      startTick(pos);
    }
  }, [startTick]);

  useEffect(() => {
    if (!isPlaying) return;
    startTick(playheadSecondsRef.current);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (playbackStartRef.current) {
        const elapsed = (performance.now() - playbackStartRef.current.wall) / 1000;
        const pos = Math.min(
          playbackStartRef.current.pos + elapsed,
          effectiveTotalRef.current,
        );
        onSeekRef.current(pos);
        playbackStartRef.current = null;
      }
    };
  }, [isPlaying, startTick]);

  useEffect(() => {
    if (!isPlaying && playheadRef.current) {
      playheadRef.current.style.left = `${(playheadSeconds / effectiveTotal) * 100}%`;
    }
  }, [playheadSeconds, effectiveTotal, isPlaying]);

  const handleRulerSeek = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!timelineWrapperRef.current) return;
    e.preventDefault();
    const rect = timelineWrapperRef.current.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(frac * effectiveTotal);
  };

  const handlePlayheadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    cancelAnimationFrame(animFrameRef.current);

    const getPos = (clientX: number): number => {
      const rect = timelineWrapperRef.current?.getBoundingClientRect();
      if (!rect) return playheadSecondsRef.current;
      const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

      return frac * effectiveTotalRef.current;
    };

    const handleMove = (me: PointerEvent) => {
      const pos = getPos(me.clientX);
      playheadSecondsRef.current = pos;
      if (playheadRef.current) {
        playheadRef.current.style.left = `${(pos / effectiveTotalRef.current) * 100}%`;
      }
    };

    const handleUp = (ue: PointerEvent) => {
      seekTo(getPos(ue.clientX));
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <Box ref={timelineWrapperRef} sx={timelineWrapperSx} data-testid="session-timeline">
      {/* Time ruler */}
      <Box sx={rulerSx} onPointerDown={handleRulerSeek}>
        {ticks.map((seconds) => (
          <Box
            key={seconds}
            sx={{
              position: 'absolute',
              left: `${(seconds / effectiveTotal) * 100}%`,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              pl: '3px',
            }}
          >
            <Typography sx={tickLabelSx}>{formatTickLabel(seconds)}</Typography>
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

      {/* Playhead */}
      <Box
        ref={playheadRef}
        sx={playheadContainerSx}
        style={{ left: `${(playheadSeconds / effectiveTotal) * 100}%` }}
      >
        <Box sx={playheadHandleSx} onPointerDown={handlePlayheadPointerDown} />
        <Box sx={playheadLineSx} />
      </Box>
    </Box>
  );
};

export { arrayMove };
