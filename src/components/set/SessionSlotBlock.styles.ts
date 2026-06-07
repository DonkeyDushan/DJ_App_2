import type { SxProps, Theme } from '@mui/material';

export const slotRootSx = (color: string, isDragging: boolean): SxProps<Theme> => ({
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
  transition: 'opacity 0.15s',
  pr: '6px',
  '&:hover .slot-actions': { opacity: 1 },
});

export const dragHandleSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  px: 0.5,
  cursor: 'grab',
  color: 'text.disabled',
  '&:active': { cursor: 'grabbing' },
  flexShrink: 0,
};

export const slotContentSx: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  overflow: 'hidden',
  px: 0.5,
  minWidth: 0,
};

export const slotNameSx = (color: string): SxProps<Theme> => ({
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.6rem',
  fontWeight: 700,
  color,
  letterSpacing: '0.05em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const slotDurationSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.55rem',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
};

export const slotTransitionSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.5rem',
  color: 'text.disabled',
  whiteSpace: 'nowrap',
};

export const actionsSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  flexShrink: 0,
  opacity: 0,
  transition: 'opacity 0.15s',
};

export const narrowActionsSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
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
