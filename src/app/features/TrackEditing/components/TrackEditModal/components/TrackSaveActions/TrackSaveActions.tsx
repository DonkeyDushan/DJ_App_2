import React from 'react';
import { Button, DialogActions, IconButton, Tooltip } from '@mui/material';
import { PenSquare } from 'pixelarticons/react/PenSquare';
import { PlusBox } from 'pixelarticons/react/PlusBox';
import { Save } from 'pixelarticons/react/Save';
import { Trash } from 'pixelarticons/react/Trash';

import { STRINGS } from '../../../../../../strings';
import { PixelIcon } from '../../../../../../components';
import {
  backButtonSx,
  deleteButtonSx,
  renameButtonSx,
  saveButtonSx,
  saveNewButtonSx,
} from './TrackSaveActions.styles';

type TrackSaveActionsProps = {
  trackColor: string;
  isPreset: boolean;
  isModifiable: boolean;
  saveNewMode: boolean;
  renameMode: boolean;
  presetNameValid: boolean;
  onSave: () => void;
  onSaveNewClick: () => void;
  onConfirmSaveNew: () => void;
  onBack: () => void;
  onRenameClick: () => void;
  onConfirmRename: () => void;
  onRenameBack: () => void;
  onDelete: () => void;
};

export const TrackSaveActions = ({
  trackColor,
  isPreset,
  isModifiable,
  saveNewMode,
  renameMode,
  presetNameValid,
  onSave,
  onSaveNewClick,
  onConfirmSaveNew,
  onBack,
  onRenameClick,
  onConfirmRename,
  onRenameBack,
  onDelete,
}: TrackSaveActionsProps): React.ReactElement => {
  const S = STRINGS.trackEditModal;

  if (renameMode) {
    return (
      <DialogActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="text"
          onClick={onRenameBack}
          sx={backButtonSx}
        >
          {S.back}
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<PixelIcon glyph={PenSquare} />}
          onClick={onConfirmRename}
          disabled={!presetNameValid}
          sx={saveNewButtonSx(trackColor)}
          data-testid="track-edit-confirm-rename"
        >
          {S.confirm}
        </Button>
      </DialogActions>
    );
  }

  return (
    <DialogActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
      {saveNewMode && (
        <Button size="small" variant="text" onClick={onBack} sx={backButtonSx}>
          {S.back}
        </Button>
      )}

      {!saveNewMode && isModifiable && (
        <Tooltip title={STRINGS.trackCard.deleteTrack}>
          <IconButton
            onClick={onDelete}
            sx={deleteButtonSx}
            data-testid="track-edit-delete"
          >
            <PixelIcon glyph={Trash} />
          </IconButton>
        </Tooltip>
      )}

      {!saveNewMode && isModifiable && (
        <Tooltip title={STRINGS.trackCard.renameTrack}>
          <IconButton
            onClick={onRenameClick}
            sx={renameButtonSx}
            data-testid="track-edit-rename"
          >
            <PixelIcon glyph={PenSquare} />
          </IconButton>
        </Tooltip>
      )}

      {!saveNewMode && (
        <Tooltip
          title={isPreset ? S.overwritePresetTooltip : S.saveToTrackTooltip}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<PixelIcon glyph={Save} />}
            onClick={onSave}
            color="secondary"
            sx={saveButtonSx}
          >
            {S.save}
          </Button>
        </Tooltip>
      )}

      {!saveNewMode ? (
        <Tooltip title={S.saveAsNewTooltip}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PixelIcon glyph={PlusBox} />}
            onClick={onSaveNewClick}
            sx={saveNewButtonSx(trackColor)}
          >
            {S.saveNew}
          </Button>
        </Tooltip>
      ) : (
        <Button
          variant="contained"
          size="small"
          startIcon={<PixelIcon glyph={PlusBox} />}
          onClick={onConfirmSaveNew}
          disabled={!presetNameValid}
          sx={saveNewButtonSx(trackColor)}
        >
          {S.confirm}
        </Button>
      )}
    </DialogActions>
  );
};
