import type { SxProps, Theme } from '@mui/material';

import {
  SELECTION_HANDLE_WIDTH_PX,
  WAVEFORM_HEIGHT_PX,
  WAVEFORM_WIDTH_PX,
} from '../../../../constants/trimDimensions';

/** Positioning context for the canvas and the absolutely placed handles. */
export const waveformRootSx: SxProps<Theme> = {
  position: 'relative',
  width: `${WAVEFORM_WIDTH_PX}px`,
  height: `${WAVEFORM_HEIGHT_PX}px`,
  maxWidth: '100%',
  touchAction: 'none',
  userSelect: 'none',
  borderRadius: '0.5rem',
  overflow: 'hidden',
};

/** Canvas display sizing — the backing resolution is scaled by devicePixelRatio
 * in script, so CSS keeps the element at its logical box size. */
export const waveformCanvasSx: SxProps<Theme> = {
  display: 'block',
  width: '100%',
  height: '100%',
};

/** Shared style for both draggable selection handles. */
export const handleSx: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  height: '100%',
  width: `${SELECTION_HANDLE_WIDTH_PX}px`,
  transform: 'translateX(-50%)',
  cursor: 'ew-resize',
  display: 'flex',
  justifyContent: 'center',
  '&::after': {
    content: '""',
    width: '2px',
    height: '100%',
    backgroundColor: 'secondary.main',
  },
};
