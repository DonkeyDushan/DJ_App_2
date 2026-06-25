import { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Close } from 'pixelarticons/react/Close';
import { Waves } from 'pixelarticons/react/Waves';
import { Box, IconButton, Popover, Tooltip, Typography } from '@mui/material';

import type { SavedMix } from '../../../../core/types/mixData';
import type { SessionSlot } from '../../../../core/types/sessionData';
import type { TransitionKind } from '../../../../core/types/transition';
import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import {
  TRANSITION_KIND_LABEL,
  TransitionEditor,
} from '../TransitionEditor/TransitionEditor';
import { MIN_SLOT_DURATION_SECONDS } from '../../constants/timelineLayout';
import { formatSlotDuration } from '../../utils/timelineFormatters';
import {
  resizeHandleSx,
  slotContentSx,
  slotDurationSx,
  slotNameSx,
  slotRootSx,
  transitionButtonSx,
  transitionChipLabelSx,
} from './SessionSlotBlock.styles';

interface SessionSlotBlockProps {
  slot: SessionSlot;
  mix: SavedMix | undefined;
  color: string;
  colorLight: string;
  widthPercent: number;
  getResizeFactor: () => number;
  onRemove: () => void;
  onDuplicate: () => void;
  onResizeDuration: (durationSeconds: number) => void;
  onSetTransitionKind: (kind: TransitionKind) => void;
  onSetTransitionDuration: (durationSeconds: number) => void;
}

export const SessionSlotBlock = ({
  slot,
  mix,
  color,
  colorLight,
  widthPercent,
  getResizeFactor,
  onRemove,
  onResizeDuration,
  onSetTransitionKind,
  onSetTransitionDuration,
}: SessionSlotBlockProps): React.ReactElement => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id, data: { type: 'slot' } });

  const rootRef = useRef<HTMLDivElement>(null);
  const [transitionAnchor, setTransitionAnchor] = useState<HTMLElement | null>(
    null,
  );

  const transitionChipLabel =
    slot.transitionKind === 'cut'
      ? TRANSITION_KIND_LABEL.cut
      : `${TRANSITION_KIND_LABEL[slot.transitionKind]} ${slot.transitionDuration}${STRINGS.set.seconds}`;

  const setRefs = (el: HTMLDivElement | null) => {
    rootRef.current = el;
    setNodeRef(el);
  };

  // Interactive controls live inside the draggable root; swallow the pointer
  // down so the drag sensor does not engage when the user clicks them.
  const stopDragStart = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    flexBasis: `${widthPercent}%`,
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startDuration = slot.durationSeconds;

    const onMouseMove = (ev: MouseEvent) => {
      const pxPerSec = getResizeFactor();
      const deltaSeconds = pxPerSec > 0 ? (ev.clientX - startX) / pxPerSec : 0;
      const newDuration = Math.max(
        MIN_SLOT_DURATION_SECONDS,
        Math.round(startDuration + deltaSeconds),
      );
      onResizeDuration(newDuration);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <Box
      ref={setRefs}
      style={style}
      sx={slotRootSx(color, isDragging)}
      data-testid={`slot-block--${slot.id}`}
      {...attributes}
      {...listeners}
    >
      <Box sx={slotContentSx}>
        <Typography sx={slotNameSx(colorLight)}>{mix?.name ?? '—'}</Typography>
        <Typography sx={slotDurationSx}>
          {formatSlotDuration(slot.durationSeconds)}
        </Typography>
        <Tooltip
          title={`${STRINGS.set.transitionType}: ${transitionChipLabel}`}
          placement="bottom"
        >
          <IconButton
            size="small"
            onPointerDown={stopDragStart}
            onClick={(e) => {
              e.stopPropagation();
              setTransitionAnchor(e.currentTarget);
            }}
            sx={transitionButtonSx}
          >
            <PixelIcon glyph={Waves} />
            <Typography sx={transitionChipLabelSx}>
              {transitionChipLabel}
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>

      <Tooltip title={STRINGS.set.removeSlot} placement="top">
        <IconButton
          size="small"
          onPointerDown={stopDragStart}
          onClick={onRemove}
          sx={{ p: 0.25, color: 'text.disabled' }}
          className="delete-slot-button"
        >
          <PixelIcon glyph={Close} />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(transitionAnchor)}
        anchorEl={transitionAnchor}
        onClose={() => setTransitionAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ root: { onPointerDown: stopDragStart } }}
      >
        <TransitionEditor
          kind={slot.transitionKind}
          durationSeconds={slot.transitionDuration}
          onChangeKind={onSetTransitionKind}
          onChangeDuration={onSetTransitionDuration}
        />
      </Popover>

      <Box
        sx={resizeHandleSx}
        onPointerDown={stopDragStart}
        onMouseDown={handleResizeMouseDown}
      />
    </Box>
  );
};
