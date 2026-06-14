import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { STRINGS } from '../../../../../strings';
import { SessionList } from '../../../../features/Session';
import type { DJSession } from '../../../../core/types/sessionData';
import { buttonSx, paperSx, titleSx } from './LoadSetDialog.styles';

type LoadSetDialogProps = {
  open: boolean;
  sessions: DJSession[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
};

export const LoadSetDialog = ({
  open,
  sessions,
  onLoad,
  onDelete,
  onToggleFavorite,
  onClose,
}: LoadSetDialogProps): React.ReactElement => (
  <Dialog open={open} onClose={onClose} PaperProps={{ sx: paperSx }}>
    <DialogTitle sx={titleSx}>
      {STRINGS.topBar.loadSet}
    </DialogTitle>

    <DialogContent sx={{ px: 2, pb: 1 }}>
      <SessionList
        sessions={sessions}
        onLoad={(id) => {
          onLoad(id);
          onClose();
        }}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
      />
    </DialogContent>

    <DialogActions>
      <Button size="small" onClick={onClose} sx={buttonSx}>
        {STRINGS.saveLoadManager.close}
      </Button>
    </DialogActions>
  </Dialog>
);
