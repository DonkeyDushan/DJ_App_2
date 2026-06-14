import React from 'react';
import { Button, DialogActions, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';

import { STRINGS } from '../../../../../../strings';
import { backButtonSx, saveButtonSx, saveNewButtonSx } from './TrackSaveActions.styles';

type TrackSaveActionsProps = {
  trackColor: string;
  isPreset: boolean;
  saveNewMode: boolean;
  presetNameValid: boolean;
  onSave: () => void;
  onSaveNewClick: () => void;
  onConfirmSaveNew: () => void;
  onBack: () => void;
};

export const TrackSaveActions = ({
  trackColor,
  isPreset,
  saveNewMode,
  presetNameValid,
  onSave,
  onSaveNewClick,
  onConfirmSaveNew,
  onBack,
}: TrackSaveActionsProps): React.ReactElement => {
  const S = STRINGS.trackEditModal;

  return (
    <DialogActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
      {saveNewMode && (
        <Button
          size="small"
          variant="text"
          onClick={onBack}
          sx={backButtonSx}
        >
          {S.back}
        </Button>
      )}

      {!saveNewMode && (
        <Tooltip title={isPreset ? S.overwritePresetTooltip : S.saveToTrackTooltip}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SaveIcon />}
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
            startIcon={<AddCircleOutlineIcon />}
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
          startIcon={<AddCircleOutlineIcon />}
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
