import React, { memo } from 'react';

import { STRINGS } from '../../../../../strings';
import { NameInputDialog } from '../../../../components';

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
  const S = STRINGS.saveLoadManager;

  return (
    <NameInputDialog
      open={open}
      title={S.saveMixTitle}
      initialName={initialName}
      placeholder={S.mixNameLabel}
      confirmLabel={S.save}
      cancelLabel={S.cancel}
      helperText={S.savesInfo}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};

export const SaveMixDialog = memo(SaveMixDialogInner);
SaveMixDialog.displayName = 'SaveMixDialog';
