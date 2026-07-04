import { AudioWaveform } from 'pixelarticons/react/AudioWaveform';
import { Save } from 'pixelarticons/react/Save';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import { formatSlotDuration } from '../../utils/timelineFormatters';
import {
  cardSx,
  rowSx,
  setMetaSx,
  setNameSx,
} from '../SetLibraryCard/SetLibraryCard.styles';

interface UnsavedSetCardProps {
  slotCount: number;
  durationSeconds: number;
  onSave: () => void;
}

/**
 * Placeholder card standing in for the current in-progress set that has not
 * been saved yet. Rendered as the active card at the top of the set library
 * whenever the working set is still a draft, so it always has a visible home.
 * Saving it turns it into a real, persisted set.
 */
export const UnsavedSetCard = ({
  slotCount,
  durationSeconds,
  onSave,
}: UnsavedSetCardProps): React.ReactElement => (
  <Paper sx={cardSx(true)} data-testid="set-library-unsaved-card">
    <Box sx={rowSx}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{ display: 'inline-flex', color: 'primary.main', mt: '-4px' }}
          >
            <PixelIcon glyph={AudioWaveform} />
          </Box>
          <Typography sx={setNameSx}>{STRINGS.set.unsavedSet}</Typography>
        </Box>
        <Typography sx={setMetaSx}>
          {slotCount} slots · {formatSlotDuration(durationSeconds)}
        </Typography>
      </Box>

      <Tooltip title={STRINGS.set.saveUnsavedSet}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          sx={{
            p: 0.25,
            color: 'pink.main',
            '&:hover': { color: 'pink.light' },
          }}
          data-testid="set-library-unsaved-save"
        >
          <PixelIcon glyph={Save} />
        </IconButton>
      </Tooltip>
    </Box>
  </Paper>
);
