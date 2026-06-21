import React, { useState } from 'react';
import { Box, Divider, TextField, Typography } from '@mui/material';

import { STRINGS } from '../../../../../../strings';
import { dividerSx, nameLabelSx, nameFieldSx } from './PresetNameField.styles';

type PresetNameFieldProps = {
  trackColor: string;
  initialName: string;
  nameRef: React.MutableRefObject<string>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onValidChange: (valid: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export const PresetNameField = ({
  trackColor,
  initialName,
  nameRef,
  inputRef,
  onValidChange,
  onConfirm,
  onCancel,
}: PresetNameFieldProps): React.ReactElement => {
  const [localName, setLocalName] = useState(initialName);

  const S = STRINGS.trackEditModal;

  const handleChange = (value: string) => {
    setLocalName(value);
    nameRef.current = value;
    onValidChange(!!value.trim());
  };

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
          value={localName}
          onChange={(e) => handleChange(e.target.value)}
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
