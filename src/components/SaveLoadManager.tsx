import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import type { SavedMix } from '../types';

type SaveLoadManagerProps = {
  saveOpen: boolean;
  loadOpen: boolean;
  mixes: SavedMix[];
  onClose: () => void;
  onSave: (name: string) => void;
  onLoad: (mixId: string) => void;
  onDelete: (mixId: string) => void;
};

export function SaveLoadManager({ saveOpen, loadOpen, mixes, onClose, onSave, onLoad, onDelete }: SaveLoadManagerProps): React.ReactElement {
  const [mixName, setMixName] = useState('Neon Session');

  useEffect(() => {
    if (saveOpen) {
      setMixName('Neon Session');
    }
  }, [saveOpen]);

  return (
    <>
      <Dialog open={saveOpen} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Save mix</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Mix name" value={mixName} onChange={(event) => setMixName(event.target.value)} fullWidth autoFocus />
            <Typography variant="body2" color="text.secondary">
              Stores selected tracks, volume, speed and global tempo.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              onSave(mixName.trim() || 'Neon Session');
              onClose();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={loadOpen} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Load mix</DialogTitle>
        <DialogContent>
          {mixes.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">No saved mixes yet.</Typography>
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
                    Load
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}