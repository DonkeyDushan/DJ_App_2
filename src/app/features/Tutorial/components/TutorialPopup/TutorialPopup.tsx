import React from 'react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { Close } from 'pixelarticons/react/Close';

import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import type { PopupPosition } from '../../utils/computePopupPosition';
import {
  bodySx,
  footerSx,
  hintSx,
  navSx,
  progressSx,
  rootSx,
  titleSx,
} from './TutorialPopup.styles';

type TutorialPopupProps = {
  title: string;
  body: string;
  /** Zero-based index of the current step. */
  stepIndex: number;
  /** Total number of steps. */
  stepCount: number;
  /** Viewport geometry for the card; applied as inline style. */
  position: PopupPosition;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
};

const TutorialPopupInner = ({
  title,
  body,
  stepIndex,
  stepCount,
  position,
  onPrev,
  onNext,
  onClose,
}: TutorialPopupProps): React.ReactElement => {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === stepCount - 1;

  return (
    <Box
      sx={rootSx}
      style={{
        top: position.top,
        left: position.left,
        transform: position.transform,
      }}
      role="dialog"
      aria-modal="true"
      data-testid="tutorial-popup"
    >
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
      >
        <Typography sx={titleSx}>{title}</Typography>

        <Tooltip title={STRINGS.tutorial.close}>
          <IconButton
            size="small"
            onClick={onClose}
            data-testid="tutorial-close"
          >
            <PixelIcon glyph={Close} />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography sx={bodySx}>{body}</Typography>

      <Typography sx={hintSx}>{STRINGS.tutorial.keyboardHint}</Typography>

      <Box sx={footerSx}>
        <Typography sx={progressSx}>
          {STRINGS.tutorial.stepLabel} {stepIndex + 1}{' '}
          {STRINGS.tutorial.stepSeparator} {stepCount}
        </Typography>

        <Box sx={navSx}>
          {!isFirst && (
            <Button
              variant="outlined"
              size="small"
              onClick={onPrev}
              data-testid="tutorial-prev"
            >
              {STRINGS.tutorial.back}
            </Button>
          )}

          <Button
            variant="contained"
            size="small"
            onClick={onNext}
            data-testid="tutorial-next"
          >
            {isLast ? STRINGS.tutorial.finish : STRINGS.tutorial.next}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export const TutorialPopup = React.memo(TutorialPopupInner);
TutorialPopup.displayName = 'TutorialPopup';
