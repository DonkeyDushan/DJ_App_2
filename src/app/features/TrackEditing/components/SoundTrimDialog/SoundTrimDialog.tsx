import React, { memo } from 'react';
import { Dialog, DialogTitle, IconButton } from '@mui/material';
import { Close } from 'pixelarticons/react/Close';

import type { CustomSoundRecord } from '../../../../core';
import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import { SoundTrimDialogBody } from './components/SoundTrimDialogBody/SoundTrimDialogBody';

type SoundTrimDialogProps = {
  open: boolean;
  sound: CustomSoundRecord | null;
  onClose: () => void;
  onSave: (soundId: string, blob: Blob, mimeType: string) => void;
};

const S = STRINGS.soundTrimDialog;

const SoundTrimDialogInner = ({
  open,
  sound,
  onClose,
  onSave,
}: SoundTrimDialogProps): React.ReactElement => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    data-testid="sound-trim-dialog"
  >
    <DialogTitle>
      {S.title}
      <IconButton size="small" onClick={onClose}>
        <PixelIcon glyph={Close} />
      </IconButton>
    </DialogTitle>

    {sound ? (
      <SoundTrimDialogBody sound={sound} onSave={onSave} onClose={onClose} />
    ) : null}
  </Dialog>
);

export const SoundTrimDialog = memo(SoundTrimDialogInner);
SoundTrimDialog.displayName = 'SoundTrimDialog';
