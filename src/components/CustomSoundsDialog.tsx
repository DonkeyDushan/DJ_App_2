import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Avatar, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material';

import type { CustomSoundRecord } from '../types';

type CustomSoundsDialogProps = {
  open: boolean;
  sounds: CustomSoundRecord[];
  onClose: () => void;
  onUpload: (file: File) => void;
  onDelete: (soundId: string) => void;
};

export function CustomSoundsDialog({ open, sounds, onClose, onUpload, onDelete }: CustomSoundsDialogProps): React.ReactElement {
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      event.target.value = '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Custom Sounds</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
            Upload sound
            <input hidden type="file" accept="audio/*" onChange={handleUpload} />
          </Button>

          {sounds.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">No custom sounds stored yet.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {sounds.map((sound) => (
                <ListItem
                  key={sound.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => onDelete(sound.id)}>
                      <DeleteForeverIcon />
                    </IconButton>
                  }
                  sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: '#090812' }}>{sound.name.slice(0, 1).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={sound.name} secondary={`${Math.round(sound.blob.size / 1024)} KB • ${sound.mimeType}`} />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}