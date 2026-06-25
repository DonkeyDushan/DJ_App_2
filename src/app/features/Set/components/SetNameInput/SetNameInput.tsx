import { useState } from 'react';
import { InputBase } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface SessionNameInputProps {
  initialName: string;
  onCommit: (name: string) => void;
  placeholder: string;
  sx?: SxProps<Theme>;
}

export const SessionNameInput = ({
  initialName,
  onCommit,
  placeholder,
  sx,
}: SessionNameInputProps): React.ReactElement => {
  const [localName, setLocalName] = useState(initialName);

  const handleBlur = () => onCommit(localName);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  return (
    <InputBase
      value={localName}
      onChange={(e) => setLocalName(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      sx={sx}
      inputProps={{ spellCheck: false }}
    />
  );
};
