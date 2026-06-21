import React, { memo, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputBase,
  Tooltip,
  Typography,
} from '@mui/material';

import { STRINGS } from '../../../../strings';
import { MIX_COLOR_KEYS, type MixColorKey } from '../../../../core';
import {
  buttonSx,
  clearSwatchSx,
  colorLabelSx,
  deleteButtonSx,
  inputSx,
  paperSx,
  swatchRowSx,
  swatchSx,
  titleSx,
} from './MixEditDialog.styles';

type MixEditDialogProps = {
  open: boolean;
  initialName: string;
  initialColor: MixColorKey | null;
  onSave: (name: string, color: MixColorKey | null) => void;
  onDelete: () => void;
  onClose: () => void;
};

const MixEditDialogInner = ({
  open,
  initialName,
  initialColor,
  onSave,
  onDelete,
  onClose,
}: MixEditDialogProps): React.ReactElement => {
  const [localName, setLocalName] = useState(initialName);
  const [localColor, setLocalColor] = useState<MixColorKey | null>(initialColor);

  useEffect(() => {
    if (open) {
      setLocalName(initialName);
      setLocalColor(initialColor);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const trimmed = localName.trim();

  const handleSave = () => {
    if (trimmed) onSave(trimmed, localColor);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: paperSx }}
      data-testid="mix-edit-dialog"
    >
      <DialogTitle sx={titleSx}>{STRINGS.mixEditDialog.title}</DialogTitle>

      <DialogContent>
        <InputBase
          autoFocus
          fullWidth
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={STRINGS.mixEditDialog.namePlaceholder}
          sx={inputSx}
          data-testid="mix-edit-dialog-field"
        />

        <Typography sx={colorLabelSx}>
          {STRINGS.mixEditDialog.colorLabel}
        </Typography>

        <Box sx={swatchRowSx}>
          <Tooltip title={STRINGS.mixEditDialog.clearColor}>
            <Box
              role="button"
              aria-label={STRINGS.mixEditDialog.clearColor}
              onClick={() => setLocalColor(null)}
              sx={clearSwatchSx(localColor === null)}
              data-testid="mix-edit-color--none"
            />
          </Tooltip>

          {MIX_COLOR_KEYS.map((colorKey) => (
            <Box
              key={colorKey}
              role="button"
              aria-label={colorKey}
              onClick={() => setLocalColor(colorKey)}
              sx={swatchSx(colorKey, localColor === colorKey)}
              data-testid={`mix-edit-color--${colorKey}`}
            />
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          size="small"
          onClick={onDelete}
          sx={deleteButtonSx}
          data-testid="mix-edit-dialog-delete"
        >
          {STRINGS.mixEditDialog.delete}
        </Button>

        <Button size="small" onClick={onClose} sx={buttonSx}>
          {STRINGS.mixEditDialog.cancel}
        </Button>

        <Button
          size="small"
          variant="contained"
          onClick={handleSave}
          disabled={!trimmed}
          sx={buttonSx}
          data-testid="mix-edit-dialog-confirm"
        >
          {STRINGS.mixEditDialog.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const MixEditDialog = memo(MixEditDialogInner);
MixEditDialog.displayName = 'MixEditDialog';
