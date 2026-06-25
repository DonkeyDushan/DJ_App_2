import React, { useCallback } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Play } from 'pixelarticons/react/Play';

import type { CustomSoundRecord } from '../../../../../../core';
import { encodeWavRegion, WAV_MIME_TYPE } from '../../../../../../core';
import { STRINGS } from '../../../../../../strings';
import { PixelIcon, PausePixelGlyph } from '../../../../../../components';
import { useDecodedSound } from '../../../../hooks/useDecodedSound';
import { useTrimSelection } from '../../../../hooks/useTrimSelection';
import { useTrimPreview } from '../../../../hooks/useTrimPreview';
import { formatTrimTime } from '../../../../utils/formatTrimTime';
import { WaveformView } from '../WaveformView/WaveformView';
import {
  contentStackSx,
  controlsRowSx,
  hintSx,
  loadingSx,
  previewButtonSx,
  readoutGroupSx,
  readoutLabelSx,
  readoutSx,
  readoutValueSx,
} from '../../SoundTrimDialog.styles';

type SoundTrimDialogBodyProps = {
  sound: CustomSoundRecord;
  onSave: (soundId: string, blob: Blob, mimeType: string) => void;
  onClose: () => void;
};

const S = STRINGS.soundTrimDialog;

export const SoundTrimDialogBody = ({
  sound,
  onSave,
  onClose,
}: SoundTrimDialogBodyProps): React.ReactElement => {
  const { context, buffer, duration, peaks, isLoading } =
    useDecodedSound(sound);
  const { startSeconds, endSeconds, setStart, setEnd } =
    useTrimSelection(duration);
  const { isPlaying, toggle, stop } = useTrimPreview(
    context,
    buffer,
    startSeconds,
    endSeconds,
  );

  const handleSave = useCallback(() => {
    if (!buffer) return;

    stop();
    const blob = encodeWavRegion(buffer, startSeconds, endSeconds);
    onSave(sound.id, blob, WAV_MIME_TYPE);
    onClose();
  }, [buffer, startSeconds, endSeconds, sound.id, onSave, onClose, stop]);

  const lengthSeconds = Math.max(0, endSeconds - startSeconds);

  return (
    <>
      <DialogContent>
        <Box sx={contentStackSx}>
          <Typography variant="body2" sx={hintSx}>
            {S.selectionHint}
          </Typography>

          {isLoading || !buffer ? (
            <Box sx={loadingSx} data-testid="trim-loading">
              <Typography variant="body2">{S.loading}</Typography>
            </Box>
          ) : (
            <WaveformView
              peaks={peaks}
              duration={duration}
              startSeconds={startSeconds}
              endSeconds={endSeconds}
              onChangeStart={setStart}
              onChangeEnd={setEnd}
            />
          )}

          <Box sx={controlsRowSx}>
            <Tooltip title={isPlaying ? S.stop : S.play}>
              <span>
                <IconButton
                  onClick={toggle}
                  disabled={!buffer}
                  sx={previewButtonSx(isPlaying)}
                  data-testid="trim-preview-toggle"
                >
                  {isPlaying ? (
                    <PixelIcon glyph={PausePixelGlyph} />
                  ) : (
                    <PixelIcon glyph={Play} />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Box sx={readoutGroupSx}>
              <Box sx={readoutSx}>
                <Typography variant="caption" sx={readoutLabelSx}>
                  {S.start}
                </Typography>
                <Typography variant="body2" sx={readoutValueSx}>
                  {formatTrimTime(startSeconds)}
                </Typography>
              </Box>
              <Box sx={readoutSx}>
                <Typography variant="caption" sx={readoutLabelSx}>
                  {S.end}
                </Typography>
                <Typography variant="body2" sx={readoutValueSx}>
                  {formatTrimTime(endSeconds)}
                </Typography>
              </Box>
              <Box sx={readoutSx}>
                <Typography variant="caption" sx={readoutLabelSx}>
                  {S.length}
                </Typography>
                <Typography variant="body2" sx={readoutValueSx}>
                  {formatTrimTime(lengthSeconds)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {S.cancel}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!buffer}
          data-testid="trim-save"
        >
          {S.save}
        </Button>
      </DialogActions>
    </>
  );
};
