import React from 'react';
import { Box, Divider, TextField, Typography } from '@mui/material';

import { STRINGS } from '../../../../../../strings';
import { dividerSx, nameLabelSx, nameFieldSx } from './PresetNameField.styles';

type PresetNameFieldProps = {
  trackColor: string;
  value: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export const PresetNameField = ({
  trackColor,
  value,
  inputRef,
  onChange,
  onConfirm,
  onCancel,
}: PresetNameFieldProps): React.ReactElement => {
  const S = STRINGS.trackEditModal;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onConfirm();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <>
      <Divider sx={dividerSx(trackColor)} />
      <Box>
        <Typography variant="caption" sx={nameLabelSx(trackColor)}>
          {S.nameNewPreset}
        </Typography>
        <TextField
          inputRef={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          fullWidth
          variant="outlined"
          placeholder={S.presetNamePlaceholder}
          sx={nameFieldSx(trackColor)}
        />
      </Box>
    </>
  );
};
