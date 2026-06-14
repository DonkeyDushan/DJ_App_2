import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputBase,
  Typography,
} from '@mui/material';

import { STRINGS } from '../../../../../strings';
import {
  buttonSx,
  helperTextSx,
  inputSx,
  paperSx,
  titleSx,
} from './SaveMixDialog.styles';

type SaveMixDialogProps = {
  open: boolean;
  mixName: string;
  onMixNameChange: (name: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export const SaveMixDialog = ({
  open,
  mixName,
  onMixNameChange,
  onConfirm,
  onClose,
}: SaveMixDialogProps): React.ReactElement => {
  const S = STRINGS.saveLoadManager;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: paperSx }}
    >
      <DialogTitle sx={titleSx}>
        {S.saveMixTitle}
      </DialogTitle>

      <DialogContent>
        <InputBase
          autoFocus
          fullWidth
          value={mixName}
          onChange={(e) => onMixNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={S.mixNameLabel}
          sx={inputSx}
        />
        <Typography sx={helperTextSx}>
          {S.savesInfo}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button size="small" onClick={onClose} sx={buttonSx}>
          {S.cancel}
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onConfirm}
          disabled={!mixName.trim()}
          sx={buttonSx}
        >
          {S.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
