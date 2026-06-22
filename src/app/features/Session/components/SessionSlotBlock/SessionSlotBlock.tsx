import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Close } from 'pixelarticons/react/Close';
import { Copy } from 'pixelarticons/react/Copy';
import { ChevronsHorizontal } from 'pixelarticons/react/ChevronsHorizontal';
import { MoreVertical } from 'pixelarticons/react/MoreVertical';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';

import type { SavedMix } from '../../../../core/types/mixData';
import type { SessionSlot } from '../../../../core/types/sessionData';
import type { TransitionKind } from '../../../../core/types/transition';
import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import {
  TRANSITION_KIND_LABEL,
  TransitionEditor,
} from '../TransitionEditor/TransitionEditor';
import {
  ACTIONS_MIN_WIDTH_PX,
  MIN_SLOT_DURATION_SECONDS,
} from '../../constants/timelineLayout';
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
  onDuplicate,
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
  const [isNarrow, setIsNarrow] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
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

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setIsNarrow(entry.contentRect.width < ACTIONS_MIN_WIDTH_PX);
    });
    observer.observe(el);

    observer.disconnect();
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
        <PixelIcon glyph={ChevronsHorizontal} />
      </Box>

      <Box sx={slotContentSx}>
        <Typography sx={slotNameSx(colorLight)}>{mix?.name ?? '—'}</Typography>
        <Typography sx={slotDurationSx}>
          {formatSlotDuration(slot.durationSeconds)}
        </Typography>
        <Tooltip title={STRINGS.set.transitionType} placement="top">
          <Typography
            component="button"
            type="button"
            sx={slotTransitionSx}
            onClick={(e) => {
              e.stopPropagation();
              setTransitionAnchor(e.currentTarget);
            }}
            data-testid={`slot-transition--${slot.id}`}
          >
            ↗ {transitionChipLabel}
          </Typography>
        </Tooltip>
      </Box>

      {isNarrow ? (
        <Box sx={narrowActionsSx}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchor(e.currentTarget);
            }}
            sx={{ p: 0.25, color: 'text.disabled' }}
          >
            <PixelIcon glyph={MoreVertical} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            slotProps={{ paper: { sx: { minWidth: '8rem' } } }}
          >
            <MenuItem
              dense
              onClick={() => {
                onDuplicate();
                setMenuAnchor(null);
              }}
              sx={{ gap: 1, fontSize: '1rem' }}
            >
              <PixelIcon glyph={Copy} />
              {STRINGS.set.duplicateSlot}
            </MenuItem>
            <MenuItem
              dense
              onClick={() => {
                onRemove();
                setMenuAnchor(null);
              }}
              sx={{ gap: 1, fontSize: '1rem', color: 'error.main' }}
            >
              <PixelIcon glyph={Close} />
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
              <PixelIcon glyph={Copy} />
            </IconButton>
          </Tooltip>
          <Tooltip title={STRINGS.set.removeSlot} placement="top">
            <IconButton
              size="small"
              onClick={onRemove}
              sx={{ p: 0.25, color: 'text.disabled' }}
            >
              <PixelIcon glyph={Close} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Popover
        open={Boolean(transitionAnchor)}
        anchorEl={transitionAnchor}
        onClose={() => setTransitionAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <TransitionEditor
          kind={slot.transitionKind}
          durationSeconds={slot.transitionDuration}
          onChangeKind={onSetTransitionKind}
          onChangeDuration={onSetTransitionDuration}
        />
      </Popover>

      <Box sx={resizeHandleSx} onMouseDown={handleResizeMouseDown} />
    </Box>
  );
};
