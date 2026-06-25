import type { SxProps, Theme } from '@mui/material';

/** Vertical stack wrapping the waveform, controls, and readouts. */
export const contentStackSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1.5,
  pt: 1,
};

/** Hint line above the waveform. */
export const hintSx: SxProps<Theme> = {
  color: 'text.secondary',
  textAlign: 'center',
};

/** Centred placeholder shown while the sound decodes. */
export const loadingSx: SxProps<Theme> = {
  height: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'text.secondary',
};

/** Row holding the preview play button and the time readouts. */
export const controlsRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  width: '100%',
};

/** Group of start/end/length readouts, pushed to the right of the controls. */
export const readoutGroupSx: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  ml: 'auto',
};

/** A single label/value readout column. */
export const readoutSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

/** Small dimmed caption above each readout value. */
export const readoutLabelSx: SxProps<Theme> = {
  color: 'text.disabled',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

/** Monospace value for each readout. */
export const readoutValueSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  color: 'text.primary',
};

/** Preview play/stop icon button. */
export const previewButtonSx = (isPlaying: boolean): SxProps<Theme> => ({
  color: isPlaying ? 'secondary.main' : 'text.secondary',
  '&:hover': {
    color: 'secondary.light',
  },
});
