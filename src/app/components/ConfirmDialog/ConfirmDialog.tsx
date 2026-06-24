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
  itemNameSx,
  messageSx,
  paperSx,
  titleSx,
} from './ConfirmDialog.styles';
import { PixelIcon } from '../PixelIcon/PixelIcon';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmDialogInner = ({
  open,
  title,
  message,
  itemName,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
}: ConfirmDialogProps): React.ReactElement => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{ sx: paperSx }}
    data-testid="confirm-dialog"
  >
    <DialogTitle sx={titleSx}>
      {title}
      <IconButton size="small" onClick={onClose}>
        <PixelIcon glyph={Close} />
      </IconButton>
    </DialogTitle>

    <DialogContent>
      {itemName != null && (
        <Typography sx={itemNameSx} title={itemName}>
          {itemName}
        </Typography>
      )}
      <Typography sx={messageSx}>{message}</Typography>
    </DialogContent>

    <DialogActions>
      <Button
        variant="outlined"
        onClick={onClose}
        data-testid="confirm-dialog-cancel"
      >
        {cancelLabel}
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={onConfirm}
        data-testid="confirm-dialog-confirm"
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export const ConfirmDialog = memo(ConfirmDialogInner);
ConfirmDialog.displayName = 'ConfirmDialog';
