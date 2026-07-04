import { IconButton, Tooltip } from '@mui/material';
import { memo } from 'react';
import { Play } from 'pixelarticons/react/Play';
import { STRINGS } from '../../strings';
import { PixelIcon } from '../PixelIcon/PixelIcon';
import { PausePixelGlyph } from '../PixelIcon/PausePixelGlyph';
import { buttonSx } from './PlayButton.styles';

const PlayButtonComponent = ({
  isPlaying,
  onToggleTransport,
  disabled = false,
  testId,
}: {
  isPlaying: boolean;
  onToggleTransport: () => void;
  disabled?: boolean;
  /** Optional test hook forwarded to the button (e.g. for the tour to target). */
  testId?: string;
}): React.ReactElement => (
  <Tooltip
    title={isPlaying ? STRINGS.mixerHeader.stop : STRINGS.mixerHeader.play}
  >
    <IconButton
      onClick={onToggleTransport}
      disabled={disabled}
      sx={buttonSx}
      data-testid={testId}
    >
      {isPlaying ? (
        <PixelIcon glyph={PausePixelGlyph} />
      ) : (
        <PixelIcon glyph={Play} />
      )}
    </IconButton>
  </Tooltip>
);

export const PlayButton = memo(PlayButtonComponent);
PlayButton.displayName = 'PlayButton';
