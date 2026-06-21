import React, { memo } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import {
  cancelButtonSx,
  confirmButtonSx,
  itemNameSx,
  messageSx,
  paperSx,
  titleSx,
} from './ConfirmDialog.styles';

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
    <DialogTitle sx={titleSx}>{title}</DialogTitle>

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
        size="small"
        onClick={onClose}
        sx={cancelButtonSx}
        data-testid="confirm-dialog-cancel"
      >
        {cancelLabel}
      </Button>
      <Button
        size="small"
        variant="contained"
        color="error"
        onClick={onConfirm}
        sx={confirmButtonSx}
        data-testid="confirm-dialog-confirm"
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export const ConfirmDialog = memo(ConfirmDialogInner);
ConfirmDialog.displayName = 'ConfirmDialog';
