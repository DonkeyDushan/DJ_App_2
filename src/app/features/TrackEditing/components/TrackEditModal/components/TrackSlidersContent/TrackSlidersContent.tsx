import React from 'react';
import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';

import { STRINGS } from '../../../../../../strings';
import { SliderRow } from '../../../SliderRow/SliderRow';
import { dividerSx, sectionLabelSx } from './TrackSlidersContent.styles';

type TrackSlidersContentProps = {
  volume: number;
  speed: number;
  eqLow: number;
  eqMid: number;
  eqHigh: number;
  reverbSend: number;
  delaySend: number;
  onVolumeChange: (v: number) => void;
  onSpeedChange: (v: number) => void;
  onEqLowChange: (v: number) => void;
  onEqMidChange: (v: number) => void;
  onEqHighChange: (v: number) => void;
  onReverbChange: (v: number) => void;
  onDelayChange: (v: number) => void;
};

export const TrackSlidersContent = ({
  volume,
  speed,
  eqLow,
  eqMid,
  eqHigh,
  reverbSend,
  delaySend,
  onVolumeChange,
  onSpeedChange,
  onEqLowChange,
  onEqMidChange,
  onEqHighChange,
  onReverbChange,
  onDelayChange,
}: TrackSlidersContentProps): React.ReactElement => {
  const theme = useTheme();

  const S = STRINGS.trackEditModal;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="caption" sx={sectionLabelSx}>
          {S.levels}
        </Typography>
        <Stack spacing={0.5} mt={0.5}>
          <SliderRow
            label={S.vol}
            value={volume}
            min={0}
            max={1}
            step={0.05}
            onChange={onVolumeChange}
            valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
            color={theme.palette.blue.main}
            labelColor={theme.palette.blue.light}
          />
          <SliderRow
            label={S.speed}
            value={speed}
            min={0.25}
            max={4}
            step={0.05}
            onChange={onSpeedChange}
            valueLabelFormat={(v) => `${v.toFixed(2)}x`}
            color={theme.palette.teal.main}
            labelColor={theme.palette.teal.light}
          />
        </Stack>
      </Box>

      <Divider sx={dividerSx} />

      <Box>
        <Typography variant="caption" sx={sectionLabelSx}>
          {S.eq}
        </Typography>
        <Stack spacing={0.5} mt={0.5}>
          <SliderRow
            label={S.low}
            value={eqLow}
            min={-30}
            max={30}
            step={0.5}
            onChange={onEqLowChange}
            valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
            color={theme.palette.yellow.main}
            labelColor={theme.palette.yellow.light}
          />
          <SliderRow
            label={S.mid}
            value={eqMid}
            min={-30}
            max={30}
            step={0.5}
            onChange={onEqMidChange}
            valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
            color={theme.palette.orange.main}
            labelColor={theme.palette.orange.light}
          />
          <SliderRow
            label={S.high}
            value={eqHigh}
            min={-30}
            max={30}
            step={0.5}
            onChange={onEqHighChange}
            valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
            color={theme.palette.red.main}
            labelColor={theme.palette.red.light}
          />
        </Stack>
      </Box>

      <Divider sx={dividerSx} />

      <Box>
        <Typography variant="caption" sx={sectionLabelSx}>
          {S.fxSends}
        </Typography>
        <Stack spacing={0.5} mt={0.5}>
          <SliderRow
            label={S.reverb}
            value={reverbSend}
            min={0}
            max={1}
            step={0.05}
            onChange={onReverbChange}
            valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
            color={theme.palette.pink.main}
            labelColor={theme.palette.pink.light}
          />
          <SliderRow
            label={S.delay}
            value={delaySend}
            min={0}
            max={1}
            step={0.05}
            onChange={onDelayChange}
            valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
            color={theme.palette.purple.main}
            labelColor={theme.palette.purple.light}
          />
        </Stack>
      </Box>
    </Stack>
  );
};
