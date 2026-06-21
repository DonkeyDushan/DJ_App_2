import { memo } from 'react';
import { Reload } from 'pixelarticons/react/Reload';
import { Save } from 'pixelarticons/react/Save';
import { Upload } from 'pixelarticons/react/Upload';
import { Box, IconButton, Slider, Tooltip, Typography } from '@mui/material';

import { Plus } from 'pixelarticons/react/Plus';
import { STRINGS } from '../../../../strings';
import { PixelIcon, PlayButton } from '../../../../components';
import {
  bpmLabelSx,
  bpmValueSx,
  headerRootSx,
  lockOverlaySx,
  tempoGroupSx,
} from './MixerHeader.styles';

/** Multiplier applied to globalTempo to get BPM at 120 BPM base. */
const BASE_BPM = 120;

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

const MixerHeaderInner = ({
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
  const bpm = Math.round(globalTempo * BASE_BPM);

  return (
    <Box sx={headerRootSx}>
      {isLocked && (
        <Box sx={lockOverlaySx}>
          <Typography
            sx={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              color: 'warning.main',
            }}
          >
            {STRINGS.mixerHeader.lockedBySet}
          </Typography>
        </Box>
      )}

      <PlayButton
        isPlaying={isPlaying}
        disabled={isLocked}
        onToggleTransport={onToggleTransport}
      />

      <Box sx={tempoGroupSx}>
        <Typography sx={bpmLabelSx}>{STRINGS.mixerHeader.bpm}</Typography>
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
        <Tooltip title={STRINGS.globalControls.customSounds}>
          <IconButton
            onClick={onOpenCustomSounds}
            disabled={isLocked}
            size="small"
          >
            <PixelIcon glyph={Upload} />
          </IconButton>
        </Tooltip>
        <Tooltip title={STRINGS.mixerHeader.reset}>
          <IconButton
            onClick={onReset}
            disabled={isLocked || !activeMixId}
            size="small"
          >
            <PixelIcon glyph={Reload} />
          </IconButton>
        </Tooltip>

        <Tooltip title={STRINGS.mixerHeader.save}>
          <IconButton
            onClick={onSave}
            disabled={isLocked || !activeMixId}
            size="small"
            sx={{
              color: 'pink.main',
              '&:hover': {
                color: 'pink.light',
              },
            }}
          >
            <PixelIcon glyph={Save} />
          </IconButton>
        </Tooltip>

        <Tooltip title={STRINGS.mixerHeader.saveNew}>
          <IconButton
            onClick={onSaveNew}
            disabled={isLocked}
            size="small"
            sx={{
              color: 'pink.main',
              '&:hover': {
                color: 'pink.light',
              },
            }}
          >
            <PixelIcon glyph={Save} />
            <PixelIcon glyph={Plus} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export const MixerHeader = memo(MixerHeaderInner);
MixerHeader.displayName = 'MixerHeader';
