import React from 'react';

import CasinoIcon from '@mui/icons-material/Casino';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

import { STRINGS } from '../strings';
import {
  masterLabelSx,
  titleSx,
  transportButtonSx,
} from './GlobalControls.styles';

type GlobalControlsProps = {
  isPlaying: boolean;
  onToggleTransport: () => void;
  onSave: () => void;
  onLoad: () => void;
  onOpenCustomSounds: () => void;
  onClearAll: () => void;
};

export const GlobalControls = ({
  isPlaying,
  onToggleTransport,
  onSave,
  onLoad,
  onOpenCustomSounds,
  onClearAll,
}: GlobalControlsProps): React.ReactElement => (
  <Paper sx={{ p: 2.5, borderRadius: 4 }}>
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap">
        <Button variant="contained" startIcon={<SaveIcon />} onClick={onSave}>
          {STRINGS.globalControls.save}
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={onLoad}
        >
          {STRINGS.globalControls.load}
        </Button>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={onOpenCustomSounds}
        >
          {STRINGS.globalControls.customSounds}
        </Button>
        <Button
          variant="outlined"
          startIcon={<DeleteSweepIcon />}
          onClick={onClearAll}
        >
          {STRINGS.globalControls.clearAll}
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="overline" sx={masterLabelSx}>
            {STRINGS.app.masterTransport}
          </Typography>
          <Typography variant="h4" sx={titleSx}>
            {STRINGS.app.title}
          </Typography>
        </Box>

        <Button
          size="large"
          variant="contained"
          onClick={onToggleTransport}
          startIcon={<CasinoIcon />}
          sx={transportButtonSx}
        >
          {isPlaying ? STRINGS.app.playing : STRINGS.app.play}
        </Button>
      </Stack>
    </Stack>
  </Paper>
);
