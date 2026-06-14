import React from 'react';

import { Box, Slider, Typography } from '@mui/material';

import { labelSx, rowSx, sliderSx, valueSx } from './SliderRow.styles';

type SliderRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  valueLabelFormat?: (v: number) => string;
  color?: string;
};

export const SliderRow = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueLabelFormat = undefined,
  color = undefined,
}: SliderRowProps): React.ReactElement => (
  <Box sx={rowSx}>
    <Typography variant="caption" sx={labelSx(color)}>
      {label}
    </Typography>
    <Slider
      size="small"
      value={value}
      min={min}
      max={max}
      step={step}
      valueLabelDisplay="auto"
      valueLabelFormat={valueLabelFormat}
      onChange={(_, v) => onChange(v as number)}
      sx={sliderSx(color)}
    />
    <Typography variant="caption" sx={valueSx}>
      {valueLabelFormat ? valueLabelFormat(value) : value.toFixed(2)}
    </Typography>
  </Box>
);
