import React, { memo, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Typography,
} from '@mui/material';
import { Close } from 'pixelarticons/react/Close';
import {
  buttonSx,
  helperTextSx,
  inputSx,
  paperSx,
  titleSx,
} from './NameInputDialog.styles';
import { PixelIcon } from '../PixelIcon/PixelIcon';

type NameInputDialogProps = {
  open: boolean;
  title: string;
  initialName: string;
  placeholder: string;
  confirmLabel: string;
  cancelLabel: string;
  helperText?: string;
  onConfirm: (name: string) => void;
  onClose: () => void;
};

const NameInputDialogInner = ({
  open,
  title,
  initialName,
  placeholder,
  confirmLabel,
  cancelLabel,
  helperText,
  onConfirm,
  onClose,
}: NameInputDialogProps): React.ReactElement => {
  const [localName, setLocalName] = useState(initialName);

  useEffect(() => {
    if (open) setLocalName(initialName);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const trimmed = localName.trim();

  const handleConfirm = () => {
    if (trimmed) onConfirm(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: paperSx }}
      data-testid="name-input-dialog"
    >
      <DialogTitle sx={titleSx}>
        {title}
        <IconButton size="small" onClick={onClose}>
          <PixelIcon glyph={Close} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <InputBase
          autoFocus
          fullWidth
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          sx={inputSx}
          data-testid="name-input-dialog-field"
        />
        {helperText != null && (
          <Typography sx={helperTextSx}>{helperText}</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button size="small" variant="outlined" onClick={onClose} sx={buttonSx}>
          {cancelLabel}
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleConfirm}
          disabled={!trimmed}
          sx={buttonSx}
          data-testid="name-input-dialog-confirm"
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const NameInputDialog = memo(NameInputDialogInner);
NameInputDialog.displayName = 'NameInputDialog';
