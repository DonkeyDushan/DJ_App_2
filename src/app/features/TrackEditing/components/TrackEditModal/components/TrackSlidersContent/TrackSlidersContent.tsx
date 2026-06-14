import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';

import { STRINGS } from '../../../../../../strings';
import { SliderRow } from '../../../SliderRow/SliderRow';
import { dividerSx, sectionLabelSx } from './TrackSlidersContent.styles';

/** EQ slider colors — fixed per band. */
const EQ_LOW_COLOR = '#40d9ff';
const EQ_MID_COLOR = '#9f6bff';
const EQ_HIGH_COLOR = '#ff8f4f';

/** FX send slider colors — fixed per send. */
const REVERB_COLOR = '#6cff9f';
const DELAY_COLOR = '#ffd84f';

type TrackSlidersContentProps = {
  trackColor: string;
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
  trackColor,
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
            color={trackColor}
          />
          <SliderRow
            label={S.speed}
            value={speed}
            min={0.25}
            max={4}
            step={0.05}
            onChange={onSpeedChange}
            valueLabelFormat={(v) => `${v.toFixed(2)}x`}
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
            color={EQ_LOW_COLOR}
          />
          <SliderRow
            label={S.mid}
            value={eqMid}
            min={-30}
            max={30}
            step={0.5}
            onChange={onEqMidChange}
            valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
            color={EQ_MID_COLOR}
          />
          <SliderRow
            label={S.high}
            value={eqHigh}
            min={-30}
            max={30}
            step={0.5}
            onChange={onEqHighChange}
            valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
            color={EQ_HIGH_COLOR}
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
            color={REVERB_COLOR}
          />
          <SliderRow
            label={S.delay}
            value={delaySend}
            min={0}
            max={1}
            step={0.05}
            onChange={onDelayChange}
            valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
            color={DELAY_COLOR}
          />
        </Stack>
      </Box>
    </Stack>
  );
};
