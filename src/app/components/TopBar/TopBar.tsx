import { memo } from 'react';
import { Box, Typography } from '@mui/material';

import { STRINGS } from '../../../strings';
import { rootSx, titleSx } from './TopBar.styles';

const TopBarInner = (): React.ReactElement => (
  <Box sx={rootSx} data-testid="top-bar">
    <Typography sx={titleSx}>{STRINGS.app.title}</Typography>
  </Box>
);

export const TopBar = memo(TopBarInner);
TopBar.displayName = 'TopBar';
