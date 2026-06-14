import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';

import type { SavedMix } from '../../../../core/types/mixData';
import type { SessionSlot } from '../../../../core/types/sessionData';
import { STRINGS } from '../../../../strings';
import { ACTIONS_MIN_WIDTH_PX, MIN_SLOT_DURATION_SECONDS } from '../../constants/timelineLayout';
import { formatSlotDuration } from '../../utils/timelineFormatters';
import {
  actionsSx,
  dragHandleSx,
  narrowActionsSx,
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

  const rootRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const setRefs = (el: HTMLDivElement | null) => {
    rootRef.current = el;
    setNodeRef(el);
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setIsNarrow(entry.contentRect.width < ACTIONS_MIN_WIDTH_PX);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

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
    >
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

      {isNarrow ? (
        <Box sx={narrowActionsSx}>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
            sx={{ p: 0.25, color: 'text.disabled' }}
          >
            <MoreVertIcon sx={{ fontSize: 10 }} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            slotProps={{ paper: { sx: { minWidth: '8rem' } } }}
          >
            <MenuItem
              dense
              onClick={() => { onDuplicate(); setMenuAnchor(null); }}
              sx={{ gap: 1, fontSize: '0.75rem' }}
            >
              <ContentCopyIcon sx={{ fontSize: 14 }} />
              {STRINGS.set.duplicateSlot}
            </MenuItem>
            <MenuItem
              dense
              onClick={() => { onRemove(); setMenuAnchor(null); }}
              sx={{ gap: 1, fontSize: '0.75rem', color: 'error.main' }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
              {STRINGS.set.removeSlot}
            </MenuItem>
          </Menu>
        </Box>
      ) : (
        <Box className="slot-actions" sx={actionsSx}>
          <Tooltip title={STRINGS.set.duplicateSlot} placement="top">
            <IconButton
              size="small"
              onClick={onDuplicate}
              sx={{ p: 0.25, color: 'text.disabled' }}
            >
              <ContentCopyIcon sx={{ fontSize: 10 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={STRINGS.set.removeSlot} placement="top">
            <IconButton
              size="small"
              onClick={onRemove}
              sx={{ p: 0.25, color: 'text.disabled' }}
            >
              <CloseIcon sx={{ fontSize: 10 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Box sx={resizeHandleSx} onMouseDown={handleResizeMouseDown} />
    </Box>
  );
};
