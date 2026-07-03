import { memo } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { STRINGS } from '../../../../strings';
import { bodySx, progressRowSx } from './SetExportDialog.styles';

interface SetExportDialogProps {
  open: boolean;
  onCancel: () => void;
}

const SetExportDialogInner = ({
  open,
  onCancel,
}: SetExportDialogProps): React.ReactElement => (
  <Dialog open={open} disableEscapeKeyDown data-testid="set-export-dialog">
    <DialogTitle>{STRINGS.setExport.exportingTitle}</DialogTitle>

    <DialogContent>
      <Box sx={progressRowSx}>
        <CircularProgress size="1.5rem" />
        <Typography sx={bodySx}>{STRINGS.setExport.exportingMessage}</Typography>
      </Box>
    </DialogContent>

    <DialogActions>
      <Button
        variant="outlined"
        onClick={onCancel}
        data-testid="set-export-cancel"
      >
        {STRINGS.setExport.cancel}
      </Button>
    </DialogActions>
  </Dialog>
);

export const SetExportDialog = memo(SetExportDialogInner);
SetExportDialog.displayName = 'SetExportDialog';
