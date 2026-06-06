import React from 'react';

import { Box, Slider, Typography } from '@mui/material';

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

export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueLabelFormat,
  color,
}: SliderRowProps): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography
        variant="caption"
        sx={{
          fontFamily: 'Orbitron, monospace',
          width: 52,
          color: color ?? 'text.secondary',
          fontSize: '0.65rem',
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}
      >
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
        sx={{ color: color ?? 'secondary.main' }}
      />
      <Typography
        variant="caption"
        sx={{
          width: 36,
          textAlign: 'right',
          color: 'text.disabled',
          fontSize: '0.65rem',
          flexShrink: 0,
        }}
      >
        {valueLabelFormat ? valueLabelFormat(value) : value.toFixed(2)}
      </Typography>
    </Box>
  );
}

SliderRow.defaultProps = {
  valueLabelFormat: undefined,
  color: undefined,
};
