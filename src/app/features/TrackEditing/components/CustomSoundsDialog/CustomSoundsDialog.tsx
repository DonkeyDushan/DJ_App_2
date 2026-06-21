import React, { memo } from 'react';

import { PenSquare } from 'pixelarticons/react/PenSquare';
import { Trash } from 'pixelarticons/react/Trash';
import { Upload } from 'pixelarticons/react/Upload';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import type { CustomSoundRecord } from '../../../../core/types/mixData';
import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import { emptyStateSx, listItemSx } from './CustomSoundsDialog.styles';

type CustomSoundsDialogProps = {
  open: boolean;
  sounds: CustomSoundRecord[];
  onClose: () => void;
  onUpload: (file: File) => void;
  onDelete: (soundId: string) => void;
  onRename: (soundId: string) => void;
};

const S = STRINGS.customSoundsDialog;

const CustomSoundsDialogInner = ({
  open,
  sounds,
  onClose,
  onUpload,
  onDelete,
  onRename,
}: CustomSoundsDialogProps): React.ReactElement => {
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      event.target.value = '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" data-testid="custom-sounds-dialog">
      <DialogTitle>{S.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Button
            component="label"
            variant="contained"
            startIcon={<PixelIcon glyph={Upload} />}
          >
            {S.uploadSound}
            <input
              hidden
              type="file"
              accept="audio/*"
              onChange={handleUpload}
            />
          </Button>

          {sounds.length === 0 ? (
            <Box sx={emptyStateSx}>
              <Typography variant="body2">{S.noCustomSounds}</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {sounds.map((sound) => (
                <ListItem
                  key={sound.id}
                  secondaryAction={
                    <>
                      <Tooltip title={S.renameSound}>
                        <IconButton
                          edge="end"
                          aria-label="rename"
                          onClick={() => onRename(sound.id)}
                          data-testid={`rename-sound--${sound.id}`}
                        >
                          <PixelIcon glyph={PenSquare} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={S.deleteSound}>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => onDelete(sound.id)}
                          data-testid={`delete-sound--${sound.id}`}
                        >
                          <PixelIcon glyph={Trash} />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                  sx={listItemSx}
                  data-testid={`sound-item--${sound.id}`}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{ bgcolor: 'secondary.main', color: '#090812' }}
                    >
                      {sound.name.slice(0, 1).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={sound.name}
                    secondary={`${Math.round(sound.blob.size / 1024)} KB • ${sound.mimeType}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export const CustomSoundsDialog = memo(CustomSoundsDialogInner);
CustomSoundsDialog.displayName = 'CustomSoundsDialog';
