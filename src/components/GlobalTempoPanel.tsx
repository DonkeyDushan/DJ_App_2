import React from 'react';

import { Paper, Slider, Stack, Typography } from '@mui/material';

import { STRINGS } from '../strings';
import { tempoLabelSx, tempoValueSx } from './GlobalTempoPanel.styles';

type GlobalTempoPanelProps = {
  globalTempo: number;
  onChange: (tempo: number) => void;
};

export const GlobalTempoPanel = ({
  globalTempo,
  onChange,
}: GlobalTempoPanelProps): React.ReactElement => {
  const bpm = Math.round(globalTempo * 120);

  return (
    <Paper sx={{ p: 2.5, borderRadius: 4 }}>
      <Stack spacing={1.25}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Typography variant="overline" sx={tempoLabelSx}>
            {STRINGS.globalTempoPanel.label}
          </Typography>
          <Typography variant="body2" sx={tempoValueSx}>
            {bpm} {STRINGS.globalTempoPanel.bpm} • x{globalTempo.toFixed(2)}
          </Typography>
        </Stack>
        <Slider
          value={globalTempo}
          min={0.5}
          max={1.5}
          step={0.05}
          onChange={(_, value) =>
            onChange(Array.isArray(value) ? value[0] : value)
          }
          valueLabelDisplay="auto"
        />
      </Stack>
    </Paper>
  );
};
