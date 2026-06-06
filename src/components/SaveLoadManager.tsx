import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import type { SavedMix } from '../types';
import { STRINGS } from '../strings';

type SaveLoadManagerProps = {
  saveOpen: boolean;
  loadOpen: boolean;
  mixes: SavedMix[];
  onClose: () => void;
  onSave: (name: string) => void;
  onLoad: (mixId: string) => void;
  onDelete: (mixId: string) => void;
};

const S = STRINGS.saveLoadManager;

export function SaveLoadManager({ saveOpen, loadOpen, mixes, onClose, onSave, onLoad, onDelete }: SaveLoadManagerProps): React.ReactElement {
  const [mixName, setMixName] = useState<string>(S.defaultMixName);

  useEffect(() => {
    if (saveOpen) {
      setMixName(S.defaultMixName);
    }
  }, [saveOpen]);

  return (
    <>
      <Dialog open={saveOpen} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{S.saveMixTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label={S.mixNameLabel} value={mixName} onChange={(event) => setMixName(event.target.value)} fullWidth autoFocus />
            <Typography variant="body2" color="text.secondary">
              {S.savesInfo}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{S.cancel}</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              onSave(mixName.trim() || S.defaultMixName);
              onClose();
            }}
          >
            {S.save}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={loadOpen} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{S.loadMixTitle}</DialogTitle>
        <DialogContent>
          {mixes.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">{S.noSavedMixes}</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {mixes.map((mix) => (
                <ListItem
                  key={mix.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => onDelete(mix.id)}>
                      <DeleteForeverIcon />
                    </IconButton>
                  }
                  sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <ListItemText
                    primary={mix.name}
                    secondary={`${new Date(mix.createdAt).toLocaleString()} • ${Object.values(mix.trackStates).filter((state) => state.enabled).length} tracks`}
                  />
                  <Button variant="outlined" onClick={() => onLoad(mix.id)}>
                    {S.load}
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{S.close}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
