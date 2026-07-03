import { AudioWaveform } from 'pixelarticons/react/AudioWaveform';
import { Save } from 'pixelarticons/react/Save';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import {
  cardSx,
  mixMetaSx,
  mixNameSx,
  rowSx,
} from '../MixLibraryCard/MixLibraryCard.styles';

interface UnsavedMixCardProps {
  trackCount: number;
  onSave: () => void;
}

/**
 * Placeholder card standing in for the current in-progress mix that has not
 * been saved yet. Rendered as the active card at the top of the mix library
 * whenever no saved mix is loaded, so the working mix always has a visible
 * home. Saving it turns it into a real, persisted mix.
 */
export const UnsavedMixCard = ({
  trackCount,
  onSave,
}: UnsavedMixCardProps): React.ReactElement => (
  <Paper sx={cardSx(true, false, false)} data-testid="mix-library-unsaved-card">
    <Box sx={rowSx}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{ display: 'inline-flex', color: 'primary.main', mt: '-4px' }}
          >
            <PixelIcon glyph={AudioWaveform} />
          </Box>
          <Typography sx={mixNameSx}>{STRINGS.mixLibrary.unsavedMix}</Typography>
        </Box>
        <Typography sx={mixMetaSx}>{trackCount} tracks</Typography>
      </Box>

      <Tooltip title={STRINGS.mixLibrary.saveUnsavedMix}>
        <IconButton
          size="small"
          onClick={onSave}
          sx={{
            p: 0.25,
            color: 'pink.main',
            '&:hover': { color: 'pink.light' },
          }}
          data-testid="mix-library-unsaved-save"
        >
          <PixelIcon glyph={Save} />
        </IconButton>
      </Tooltip>
    </Box>
  </Paper>
);
