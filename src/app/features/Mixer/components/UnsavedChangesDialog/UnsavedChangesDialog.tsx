import React, { memo } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { Close } from 'pixelarticons/react/Close';

import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import {
  buttonSx,
  discardButtonSx,
  messageSx,
  paperSx,
} from './UnsavedChangesDialog.styles';

type UnsavedChangesDialogProps = {
  open: boolean;
  /**
   * Whether a saved mix is currently loaded and can be overwritten in place.
   * False for a brand-new mix, where only "Save new" makes sense.
   */
  canOverwrite: boolean;
  onSaveOverwrite: () => void;
  onSaveNew: () => void;
  onDiscard: () => void;
  onClose: () => void;
};

const UnsavedChangesDialogInner = ({
  open,
  canOverwrite,
  onSaveOverwrite,
  onSaveNew,
  onDiscard,
  onClose,
}: UnsavedChangesDialogProps): React.ReactElement => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{ sx: paperSx }}
    data-testid="unsaved-changes-dialog"
  >
    <DialogTitle>
      {STRINGS.unsavedMixDialog.title}
      <IconButton size="small" onClick={onClose}>
        <PixelIcon glyph={Close} />
      </IconButton>
    </DialogTitle>

    <DialogContent>
      <Typography sx={messageSx}>{STRINGS.unsavedMixDialog.message}</Typography>
    </DialogContent>

    <DialogActions>
      <Button
        variant="text"
        onClick={onDiscard}
        sx={discardButtonSx}
        data-testid="unsaved-changes-discard"
      >
        {STRINGS.unsavedMixDialog.discard}
      </Button>

      <Button variant="outlined" onClick={onClose} sx={buttonSx}>
        {STRINGS.unsavedMixDialog.cancel}
      </Button>

      <Button
        variant="outlined"
        onClick={onSaveNew}
        sx={buttonSx}
        data-testid="unsaved-changes-save-new"
      >
        {STRINGS.unsavedMixDialog.saveNew}
      </Button>

      {canOverwrite && (
        <Button
          variant="contained"
          onClick={onSaveOverwrite}
          sx={buttonSx}
          data-testid="unsaved-changes-save"
        >
          {STRINGS.unsavedMixDialog.save}
        </Button>
      )}
    </DialogActions>
  </Dialog>
);

export const UnsavedChangesDialog = memo(UnsavedChangesDialogInner);
UnsavedChangesDialog.displayName = 'UnsavedChangesDialog';
