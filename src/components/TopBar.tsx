import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Button, Typography } from '@mui/material';

import { STRINGS } from '../strings';
import { rootSx, titleSx } from './TopBar.styles';

interface TopBarProps {
  onSaveSet: () => void;
  onLoadSet: () => void;
}

export const TopBar = ({ onSaveSet, onLoadSet }: TopBarProps): React.ReactElement => (
  <Box sx={rootSx}>
    <Typography sx={titleSx}>{STRINGS.app.title}</Typography>

    <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<UploadFileIcon sx={{ fontSize: '0.75rem !important' }} />}
        onClick={onLoadSet}
        sx={{
          py: 0.25,
          px: 1.25,
          fontSize: '0.6rem',
          fontFamily: 'Orbitron, monospace',
          letterSpacing: '0.08em',
        }}
      >
        {STRINGS.topBar.loadSet}
      </Button>
      <Button
        size="small"
        variant="contained"
        startIcon={<SaveIcon sx={{ fontSize: '0.75rem !important' }} />}
        onClick={onSaveSet}
        sx={{
          py: 0.25,
          px: 1.25,
          fontSize: '0.6rem',
          fontFamily: 'Orbitron, monospace',
          letterSpacing: '0.08em',
        }}
      >
        {STRINGS.topBar.saveSet}
      </Button>
    </Box>
  </Box>
);
