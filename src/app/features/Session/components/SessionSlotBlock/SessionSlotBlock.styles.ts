import type { SxProps, Theme } from '@mui/material';

export const slotRootSx = (
  color: string,
  isDragging: boolean,
): SxProps<Theme> => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'stretch',
  height: '100%',
  flexShrink: 0,
  background: `linear-gradient(135deg, ${color}28 0%, ${color}12 100%)`,
  border: `1px solid ${color}66`,
  borderRadius: '0.375rem',
  opacity: isDragging ? 0.4 : 1,
  overflow: 'hidden',
  userSelect: 'none',
  cursor: isDragging ? 'grabbing' : 'grab',
  transition: 'opacity 0.15s',
  pr: '6px',
  '.delete-slot-button': {
    opacity: 0,
    transition: 'opacity 0.15s',
  },
  '&:hover .delete-slot-button': {
    opacity: 1,
    '&:hover': { svg: { color: 'red.light' } },
  },
});

export const slotContentSx: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  overflow: 'hidden',
  px: 1.5,
  minWidth: 0,
};

export const slotNameSx = (color: string): SxProps<Theme> => ({
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
  fontWeight: 700,
  color,
  letterSpacing: '0.05em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  // Parent column uses align-items: flex-start, so the item shrinks to its
  // content width; cap it to the column width to let the ellipsis engage.
  maxWidth: '100%',
});

export const slotDurationSx: SxProps<Theme> = {
  fontFamily: 'Mozilla Headline, monospace',
  fontSize: '0.875rem',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export const transitionButtonSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 0.5,
  p: 0.25,
  maxWidth: '100%',
  minWidth: 0,
  // Keep the glyph at its fixed grid size; only the label may shrink.
  '& svg': { flexShrink: 0 },
};

export const transitionChipLabelSx: SxProps<Theme> = {
  ...slotDurationSx,
  // Flex items default to min-width: auto, which blocks shrinking below the
  // text's intrinsic width and prevents the ellipsis from ever engaging.
  minWidth: 0,
};

export const resizeHandleSx: SxProps<Theme> = {
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: '6px',
  cursor: 'col-resize',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'rgba(255,255,255,0.06)',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' },
  transition: 'background-color 0.15s',
  zIndex: 1,
};
