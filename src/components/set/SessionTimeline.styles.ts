import type { SxProps, Theme } from '@mui/material';

export const timelineWrapperSx: SxProps<Theme> = {
  borderRadius: 1,
  border: '1px solid rgba(255,255,255,0.06)',
  bgcolor: 'rgba(0,0,0,0.28)',
  overflow: 'hidden',
  flexShrink: 0,
  width: '100%',
};

export const rulerSx: SxProps<Theme> = {
  position: 'relative',
  height: '1.25rem',
  width: '100%',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

export const tickLabelSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.55rem',
  color: 'text.disabled',
  userSelect: 'none',
  lineHeight: 1,
};

export const slotsRowSx = (isOver: boolean): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'stretch',
  height: '5rem',
  width: '100%',
  gap: '2px',
  p: '2px',
  outline: isOver ? '2px solid rgba(64,217,255,0.5)' : '2px solid transparent',
  outlineOffset: '-2px',
  borderRadius: 1,
  transition: 'outline-color 0.15s',
});

export const emptyTimelineSx: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px dashed rgba(255,255,255,0.12)',
  borderRadius: 1,
  m: '4px',
};

export const emptyLabelSx: SxProps<Theme> = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.7rem',
  color: 'text.disabled',
  textAlign: 'center',
};
