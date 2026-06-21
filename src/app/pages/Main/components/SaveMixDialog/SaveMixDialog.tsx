import React, { memo, useEffect, useState } from 'react';
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
  initialName: string;
  onConfirm: (name: string) => void;
  onClose: () => void;
};

const SaveMixDialogInner = ({
  open,
  initialName,
  onConfirm,
  onClose,
}: SaveMixDialogProps): React.ReactElement => {
  const [localName, setLocalName] = useState(initialName);

  useEffect(() => {
    if (open) setLocalName(initialName);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const S = STRINGS.saveLoadManager;

  const handleConfirm = () => onConfirm(localName);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
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
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
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
          onClick={handleConfirm}
          disabled={!localName.trim()}
          sx={buttonSx}
        >
          {S.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const SaveMixDialog = memo(SaveMixDialogInner);
SaveMixDialog.displayName = 'SaveMixDialog';
