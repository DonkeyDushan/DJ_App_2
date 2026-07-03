import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

import {
  WAVEFORM_HEIGHT_PX,
  WAVEFORM_WIDTH_PX,
} from '../../../../constants/trimDimensions';
import {
  WAVEFORM_BACKGROUND_COLOR,
  WAVEFORM_SELECTED_COLOR,
  WAVEFORM_UNSELECTED_COLOR,
} from '../../../../constants/trimWaveformColors';
import {
  handleSx,
  waveformCanvasSx,
  waveformRootSx,
} from './WaveformView.styles';

type WaveformViewProps = {
  peaks: Float32Array;
  duration: number;
  startSeconds: number;
  endSeconds: number;
  onChangeStart: (seconds: number) => void;
  onChangeEnd: (seconds: number) => void;
};

const clampRatio = (value: number): number => Math.min(1, Math.max(0, value));

const drawWaveform = (
  canvas: HTMLCanvasElement,
  peaks: Float32Array,
  startRatio: number,
  endRatio: number,
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = WAVEFORM_WIDTH_PX * dpr;
  canvas.height = WAVEFORM_HEIGHT_PX * dpr;
  ctx.scale(dpr, dpr);

  ctx.fillStyle = WAVEFORM_BACKGROUND_COLOR;
  ctx.fillRect(0, 0, WAVEFORM_WIDTH_PX, WAVEFORM_HEIGHT_PX);

  const midline = WAVEFORM_HEIGHT_PX / 2;
  const startX = startRatio * WAVEFORM_WIDTH_PX;
  const endX = endRatio * WAVEFORM_WIDTH_PX;
  const columnWidth = WAVEFORM_WIDTH_PX / peaks.length;

  for (let i = 0; i < peaks.length; i += 1) {
    const x = i * columnWidth;
    const barHeight = Math.max(1, peaks[i] * WAVEFORM_HEIGHT_PX);
    const inSelection = x >= startX && x <= endX;
    ctx.fillStyle = inSelection
      ? WAVEFORM_SELECTED_COLOR
      : WAVEFORM_UNSELECTED_COLOR;
    ctx.fillRect(x, midline - barHeight / 2, columnWidth, barHeight);
  }
};

const WaveformViewInner = ({
  peaks,
  duration,
  startSeconds,
  endSeconds,
  onChangeStart,
  onChangeEnd,
}: WaveformViewProps): React.ReactElement => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startRatio = duration > 0 ? clampRatio(startSeconds / duration) : 0;
  const endRatio = duration > 0 ? clampRatio(endSeconds / duration) : 1;

  useEffect(() => {
    if (canvasRef.current && peaks.length > 0) {
      drawWaveform(canvasRef.current, peaks, startRatio, endRatio);
    }
  }, [peaks, startRatio, endRatio]);

  const secondsFromClientX = useCallback(
    (clientX: number): number => {
      const root = rootRef.current;
      if (!root || duration <= 0) return 0;

      const rect = root.getBoundingClientRect();
      const ratio = clampRatio((clientX - rect.left) / rect.width);

      return ratio * duration;
    },
    [duration],
  );

  const handleStartPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handleStartPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

      onChangeStart(secondsFromClientX(event.clientX));
    },
    [onChangeStart, secondsFromClientX],
  );

  const handleEndPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

      onChangeEnd(secondsFromClientX(event.clientX));
    },
    [onChangeEnd, secondsFromClientX],
  );

  return (
    <Box ref={rootRef} sx={waveformRootSx} data-testid="trim-waveform">
      <Box component="canvas" ref={canvasRef} sx={waveformCanvasSx} />

      <Box
        sx={handleSx}
        style={{ left: `${startRatio * 100}%` }}
        onPointerDown={handleStartPointerDown}
        onPointerMove={handleStartPointerMove}
        data-testid="trim-handle-start"
      />

      <Box
        sx={handleSx}
        style={{ left: `${endRatio * 100}%` }}
        onPointerDown={handleStartPointerDown}
        onPointerMove={handleEndPointerMove}
        data-testid="trim-handle-end"
      />
    </Box>
  );
};

export const WaveformView = memo(WaveformViewInner);
WaveformView.displayName = 'WaveformView';
