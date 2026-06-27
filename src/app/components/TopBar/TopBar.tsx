import { memo } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Save } from 'pixelarticons/react/Save';
import { Folder } from 'pixelarticons/react/Folder';
import { Reload } from 'pixelarticons/react/Reload';

import { STRINGS } from '../../../strings';
import { PixelIcon } from '../PixelIcon/PixelIcon';
import {
  actionsSx,
  dirtyDotSx,
  rootSx,
  titleSx,
} from './TopBar.styles';

interface TopBarProps {
  isDirty: boolean;
  onSaveSession: () => void;
  onLoadSession: () => void;
  onNewSession: () => void;
}

const TopBarInner = ({
  isDirty,
  onSaveSession,
  onLoadSession,
  onNewSession,
}: TopBarProps): React.ReactElement => (
  <Box sx={rootSx} data-testid="top-bar">
    <Typography sx={titleSx}>{STRINGS.app.title}</Typography>

    <Tooltip title={isDirty ? STRINGS.session.unsaved : STRINGS.session.saved}>
      <Box
        component="span"
        sx={dirtyDotSx}
        data-dirty={isDirty}
        data-testid="session-dirty-indicator"
      />
    </Tooltip>

    <Box sx={actionsSx}>
      <Tooltip title={STRINGS.session.save}>
        <IconButton
          onClick={onSaveSession}
          size="small"
          data-testid="session-save"
        >
          <PixelIcon glyph={Save} />
        </IconButton>
      </Tooltip>
      <Tooltip title={STRINGS.session.load}>
        <IconButton
          onClick={onLoadSession}
          size="small"
          data-testid="session-load"
        >
          <PixelIcon glyph={Folder} />
        </IconButton>
      </Tooltip>
      <Tooltip title={STRINGS.session.new}>
        <IconButton
          onClick={onNewSession}
          size="small"
          data-testid="session-new"
        >
          <PixelIcon glyph={Reload} />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

export const TopBar = memo(TopBarInner);
TopBar.displayName = 'TopBar';
