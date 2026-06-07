import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, IconButton, Slider, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../strings';
import {
  bpmLabelSx,
  bpmValueSx,
  headerRootSx,
  lockOverlaySx,
  tempoGroupSx,
} from './MixerHeader.styles';

interface MixerHeaderProps {
  isPlaying: boolean;
  globalTempo: number;
  activeMixId: string | null;
  isLocked: boolean;
  onToggleTransport: () => void;
  onTempoChange: (tempo: number) => void;
  onReset: () => void;
  onSave: () => void;
  onSaveNew: () => void;
  onOpenCustomSounds: () => void;
}

export const MixerHeader = ({
  isPlaying,
  globalTempo,
  activeMixId,
  isLocked,
  onToggleTransport,
  onTempoChange,
  onReset,
  onSave,
  onSaveNew,
  onOpenCustomSounds,
}: MixerHeaderProps): React.ReactElement => {
  const bpm = Math.round(globalTempo * 120);

  return (
    <Box sx={headerRootSx}>
      {isLocked && (
        <Box sx={lockOverlaySx}>
          <Typography
            sx={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'warning.main',
            }}
          >
            {STRINGS.mixerHeader.lockedBySet}
          </Typography>
        </Box>
      )}

      <Tooltip title={isPlaying ? STRINGS.mixerHeader.stop : STRINGS.mixerHeader.play}>
        <IconButton
          onClick={onToggleTransport}
          disabled={isLocked}
          sx={{
            color: isPlaying ? 'warning.main' : 'success.main',
            bgcolor: isPlaying ? 'rgba(255,143,79,0.12)' : 'rgba(108,255,159,0.1)',
            border: '1px solid',
            borderColor: isPlaying ? 'warning.main' : 'success.main',
            borderRadius: 1,
            p: 0.5,
            '&:hover': {
              bgcolor: isPlaying ? 'rgba(255,143,79,0.22)' : 'rgba(108,255,159,0.2)',
            },
            '&.Mui-disabled': { opacity: 0.35 },
          }}
        >
          {isPlaying ? (
            <PauseIcon sx={{ fontSize: 18 }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Tooltip>

      <Box sx={tempoGroupSx}>
        <Typography sx={bpmLabelSx}>
          {STRINGS.mixerHeader.bpm}
        </Typography>
        <Typography sx={bpmValueSx}>{bpm}</Typography>
        <Slider
          value={globalTempo}
          min={0.5}
          max={1.5}
          step={0.05}
          disabled={isLocked}
          onChange={(_, v) => onTempoChange(Array.isArray(v) ? v[0] : v)}
          sx={{ width: '7rem', color: 'primary.main' }}
          size="small"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, ml: 'auto' }}>
        <Tooltip title={STRINGS.mixerHeader.reset}>
          <span>
            <IconButton
              onClick={onReset}
              disabled={isLocked || !activeMixId}
              size="small"
              sx={{
                color: 'text.secondary',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 1,
                p: 0.5,
                '&:hover': { color: 'text.primary', borderColor: 'rgba(255,255,255,0.25)' },
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>

        <Button
          size="small"
          variant="outlined"
          startIcon={<SaveIcon sx={{ fontSize: '0.75rem !important' }} />}
          onClick={onSave}
          disabled={isLocked || !activeMixId}
          sx={{
            py: 0.25,
            px: 1,
            fontSize: '0.6rem',
            minWidth: 0,
            fontFamily: 'Orbitron, monospace',
            letterSpacing: '0.06em',
          }}
        >
          {STRINGS.mixerHeader.save}
        </Button>

        <Button
          size="small"
          variant="contained"
          startIcon={<SaveIcon sx={{ fontSize: '0.75rem !important' }} />}
          onClick={onSaveNew}
          disabled={isLocked}
          sx={{
            py: 0.25,
            px: 1,
            fontSize: '0.6rem',
            minWidth: 0,
            fontFamily: 'Orbitron, monospace',
            letterSpacing: '0.06em',
          }}
        >
          {STRINGS.mixerHeader.saveNew}
        </Button>

        <Tooltip title={STRINGS.globalControls.customSounds}>
          <span>
            <IconButton
              onClick={onOpenCustomSounds}
              disabled={isLocked}
              size="small"
              sx={{
                color: 'text.secondary',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 1,
                p: 0.5,
                '&:hover': { color: 'text.primary', borderColor: 'rgba(255,255,255,0.25)' },
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};
