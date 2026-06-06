import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import type { SavedMix, SessionSlot } from '../../types';
import { MIN_SLOT_DURATION_SECONDS, formatSlotDuration } from './timelineConstants';
import {
  actionsSx,
  dragHandleSx,
  resizeHandleSx,
  slotContentSx,
  slotDurationSx,
  slotNameSx,
  slotRootSx,
  slotTransitionSx,
} from './SessionSlotBlock.styles';

interface SessionSlotBlockProps {
  slot: SessionSlot;
  mix: SavedMix | undefined;
  color: string;
  widthPercent: number;
  getResizeFactor: () => number;
  onRemove: () => void;
  onDuplicate: () => void;
  onResizeDuration: (durationSeconds: number) => void;
}

export const SessionSlotBlock = ({
  slot,
  mix,
  color,
  widthPercent,
  getResizeFactor,
  onRemove,
  onDuplicate,
  onResizeDuration,
}: SessionSlotBlockProps): React.ReactElement => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id, data: { type: 'slot' } });

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
    <Box ref={setNodeRef} style={style} sx={slotRootSx(color, isDragging)}>
      <Box {...attributes} {...listeners} sx={dragHandleSx}>
        <DragHandleIcon sx={{ fontSize: 14 }} />
      </Box>

      <Box sx={slotContentSx}>
        <Typography sx={slotNameSx(color)}>{mix?.name ?? '—'}</Typography>
        <Typography sx={slotDurationSx}>
          {formatSlotDuration(slot.durationSeconds)}
        </Typography>
        <Typography sx={slotTransitionSx}>↗ {slot.transitionDuration}s</Typography>
      </Box>

      <Box className="slot-actions" sx={actionsSx}>
        <Tooltip title="Duplicate" placement="top">
          <IconButton
            size="small"
            onClick={onDuplicate}
            sx={{ p: 0.25, color: 'text.disabled' }}
          >
            <ContentCopyIcon sx={{ fontSize: 10 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove" placement="top">
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{ p: 0.25, color: 'text.disabled' }}
          >
            <CloseIcon sx={{ fontSize: 10 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={resizeHandleSx} onMouseDown={handleResizeMouseDown} />
    </Box>
  );
};
