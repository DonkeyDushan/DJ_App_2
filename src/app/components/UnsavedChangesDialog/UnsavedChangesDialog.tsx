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

import {
  buttonSx,
  discardButtonSx,
  messageSx,
  paperSx,
} from './UnsavedChangesDialog.styles';
import { PixelIcon } from '../PixelIcon/PixelIcon';

type UnsavedChangesDialogProps = {
  open: boolean;
  title: string;
  message: string;
  discardLabel: string;
  cancelLabel: string;
  onDiscard: () => void;
  onClose: () => void;
  /** Primary save action (overwrite in place). Omitted when nothing can be
   * overwritten — e.g. a brand-new item that must be saved as new instead. */
  saveLabel?: string;
  onSave?: () => void;
  /** Secondary "save as a new item" action. Omitted where not applicable. */
  saveNewLabel?: string;
  onSaveNew?: () => void;
};

const UnsavedChangesDialogInner = ({
  open,
  title,
  message,
  discardLabel,
  cancelLabel,
  onDiscard,
  onClose,
  saveLabel,
  onSave,
  saveNewLabel,
  onSaveNew,
}: UnsavedChangesDialogProps): React.ReactElement => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{ sx: paperSx }}
    data-testid="unsaved-changes-dialog"
  >
    <DialogTitle>
      {title}
      <IconButton size="small" onClick={onClose}>
        <PixelIcon glyph={Close} />
      </IconButton>
    </DialogTitle>

    <DialogContent>
      <Typography sx={messageSx}>{message}</Typography>
    </DialogContent>

    <DialogActions>
      <Button
        variant="text"
        onClick={onDiscard}
        sx={discardButtonSx}
        data-testid="unsaved-changes-discard"
      >
        {discardLabel}
      </Button>

      <Button variant="outlined" onClick={onClose} sx={buttonSx}>
        {cancelLabel}
      </Button>

      {saveNewLabel && onSaveNew && (
        <Button
          variant="outlined"
          onClick={onSaveNew}
          sx={buttonSx}
          data-testid="unsaved-changes-save-new"
        >
          {saveNewLabel}
        </Button>
      )}

      {saveLabel && onSave && (
        <Button
          variant="contained"
          onClick={onSave}
          sx={buttonSx}
          data-testid="unsaved-changes-save"
        >
          {saveLabel}
        </Button>
      )}
    </DialogActions>
  </Dialog>
);

export const UnsavedChangesDialog = memo(UnsavedChangesDialogInner);
UnsavedChangesDialog.displayName = 'UnsavedChangesDialog';
