import CasinoIcon from '@mui/icons-material/Casino';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

import { STRINGS } from '../strings';

type GlobalControlsProps = {
  isPlaying: boolean;
  onToggleTransport: () => void;
  onSave: () => void;
  onLoad: () => void;
  onOpenCustomSounds: () => void;
  onClearAll: () => void;
};

export function GlobalControls({
  isPlaying,
  onToggleTransport,
  onSave,
  onLoad,
  onOpenCustomSounds,
  onClearAll,
}: GlobalControlsProps): React.ReactElement {
  return (
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
            <Typography
              variant="overline"
              sx={{ color: 'secondary.main', letterSpacing: '0.3em' }}
            >
              {STRINGS.app.masterTransport}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 18px rgba(255,79,216,0.42)',
              }}
            >
              {STRINGS.app.title}
            </Typography>
          </Box>

          <Button
            size="large"
            variant="contained"
            onClick={onToggleTransport}
            startIcon={<CasinoIcon />}
            sx={{ minWidth: 220, height: 72, borderRadius: 3, fontSize: 20 }}
          >
            {isPlaying ? STRINGS.app.playing : STRINGS.app.play}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
