import { useCallback, useEffect, useRef } from 'react';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { Box, Typography, useTheme } from '@mui/material';

import { STRINGS } from '../../../../strings';
import type { DJSet } from '../../../../core/types/setData';
import type { TransitionKind } from '../../../../core/types/transition';
import type { SavedMix } from '../../../../core/types/mixData';
import { SetSlotBlock } from '../SetSlotBlock/SetSlotBlock';
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
} from './SetTimeline.styles';
import {
  formatTickLabel,
  getTickIntervalSeconds,
} from '../../utils/timelineFormatters';

export const TIMELINE_DROPPABLE_ID = 'timeline';

interface SetTimelineProps {
  set: DJSet;
  mixes: SavedMix[];
  isPlaying: boolean;
  playheadSeconds: number;
  onDragEnd: (event: DragEndEvent) => void;
  onRemoveSlot: (slotId: string) => void;
  onDuplicateSlot: (slotId: string) => void;
  onSetSlotDuration: (slotId: string, durationSeconds: number) => void;
  onSetSlotTransitionKind: (slotId: string, kind: TransitionKind) => void;
  onSetSlotTransitionDuration: (slotId: string, durationSeconds: number) => void;
  onSeek: (seconds: number) => void;
}

/** Neutral slot color used when a mix has no accent color assigned. */
const SLOT_COLOR_FALLBACK = '#808080';
const SLOT_COLOR_LIGHT_FALLBACK = '#ebebeb';

export const SetTimeline = ({
  set,
  mixes,
  isPlaying,
  playheadSeconds,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDragEnd: _onDragEnd,
  onRemoveSlot,
  onDuplicateSlot,
  onSetSlotDuration,
  onSetSlotTransitionKind,
  onSetSlotTransitionDuration,
  onSeek,
}: SetTimelineProps): React.ReactElement => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const { isOver, setNodeRef } = useDroppable({ id: TIMELINE_DROPPABLE_ID });

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const playheadSecondsRef = useRef(playheadSeconds);
  useEffect(() => {
    playheadSecondsRef.current = playheadSeconds;
  }, [playheadSeconds]);

  const onSeekRef = useRef(onSeek);
  useEffect(() => {
    onSeekRef.current = onSeek;
  }, [onSeek]);

  const slotTotalSeconds = set.slots.reduce(
    (sum, s) => sum + s.durationSeconds,
    0,
  );
  const effectiveTotal = Math.max(
    set.totalDurationSeconds,
    slotTotalSeconds,
    1,
  );

  const effectiveTotalRef = useRef(effectiveTotal);
  useEffect(() => {
    effectiveTotalRef.current = effectiveTotal;
  }, [effectiveTotal]);

  const animFrameRef = useRef<number>(0);
  const playbackStartRef = useRef<{ wall: number; pos: number } | null>(null);

  const tickIntervalSeconds = getTickIntervalSeconds(effectiveTotal);
  const tickCount = Math.ceil(effectiveTotal / tickIntervalSeconds);
  const ticks = Array.from(
    { length: tickCount + 1 },
    (_, i) => i * tickIntervalSeconds,
  );

  const slotIds = set.slots.map((s) => s.id);

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

  const seekTo = useCallback(
    (pos: number) => {
      playheadSecondsRef.current = pos;
      if (playheadRef.current) {
        playheadRef.current.style.left = `${(pos / effectiveTotalRef.current) * 100}%`;
      }
      onSeekRef.current(pos);
      if (isPlayingRef.current) {
        startTick(pos);
      }
    },
    [startTick],
  );

  useEffect(() => {
    if (!isPlaying) return undefined;

    startTick(playheadSecondsRef.current);

    // On pause/unmount: stop the animation loop and commit the final position.
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (playbackStartRef.current) {
        const elapsed =
          (performance.now() - playbackStartRef.current.wall) / 1000;
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
    <Box
      ref={timelineWrapperRef}
      sx={timelineWrapperSx}
      data-testid="set-timeline"
    >
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
        {set.slots.length === 0 ? (
          <Box sx={emptyTimelineSx}>
            <Typography sx={emptyLabelSx}>{STRINGS.set.noSlots}</Typography>
          </Box>
        ) : (
          <SortableContext
            items={slotIds}
            strategy={horizontalListSortingStrategy}
          >
            {set.slots.map((slot) => {
              const widthPercent =
                (slot.durationSeconds / effectiveTotal) * 100;
              const mix = mixes.find((m) => m.id === slot.mixId);
              const color = mix?.color
                ? (theme.palette[mix.color] as { main: string }).main
                : SLOT_COLOR_FALLBACK;
              const colorLight = mix?.color
                ? (theme.palette[mix.color] as { light: string }).light
                : SLOT_COLOR_LIGHT_FALLBACK;

              return (
                <SetSlotBlock
                  key={slot.id}
                  slot={slot}
                  mix={mix}
                  color={color}
                  colorLight={colorLight}
                  widthPercent={widthPercent}
                  getResizeFactor={getResizeFactor}
                  onRemove={() => onRemoveSlot(slot.id)}
                  onDuplicate={() => onDuplicateSlot(slot.id)}
                  onResizeDuration={(d) => onSetSlotDuration(slot.id, d)}
                  onSetTransitionKind={(k) =>
                    onSetSlotTransitionKind(slot.id, k)
                  }
                  onSetTransitionDuration={(d) =>
                    onSetSlotTransitionDuration(slot.id, d)
                  }
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
