import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Button, Tooltip, Typography } from '@mui/material';

import { STRINGS } from '../strings';
import { rootSx, titleSx } from './TopBar.styles';

interface TopBarProps {
  onSaveSet: () => void;
  onLoadSet: () => void;
  onResetSet: () => void;
  hasUnsavedChanges: boolean;
}

export const TopBar = ({ onSaveSet, onLoadSet, onResetSet, hasUnsavedChanges }: TopBarProps): React.ReactElement => (
  <Box sx={rootSx}>
    <Typography sx={titleSx}>{STRINGS.app.title}</Typography>

    <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
      <Tooltip title={STRINGS.topBar.resetSet}>
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RestartAltIcon sx={{ fontSize: '0.75rem !important' }} />}
            onClick={onResetSet}
            disabled={!hasUnsavedChanges}
            sx={{
              py: 0.25,
              px: 1.25,
              fontSize: '0.6rem',
              fontFamily: 'Orbitron, monospace',
              letterSpacing: '0.08em',
              color: 'warning.main',
              borderColor: 'warning.main',
              '&:hover': { borderColor: 'warning.light', bgcolor: 'rgba(255,143,79,0.08)' },
              '&.Mui-disabled': { opacity: 0.3 },
            }}
          >
            {STRINGS.topBar.resetSet}
          </Button>
        </span>
      </Tooltip>
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
