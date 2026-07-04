import React, { useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { Close } from 'pixelarticons/react/Close';

import { STRINGS } from '../../../../strings';
import { PixelIcon } from '../../../../components';
import { TUTORIAL_STEPS } from '../../constants/tutorialSteps';
import { TUTORIAL_TOPICS } from '../../constants/tutorialTopics';
import type { TutorialTopic } from '../../types/tutorialStep';
import type { PopupPosition } from '../../utils/computePopupPosition';
import {
  bodySx,
  footerSx,
  hintSx,
  navSx,
  progressSx,
  rootSx,
  tabsSx,
  titleSx,
} from './TutorialPopup.styles';

type TutorialPopupProps = {
  title: string;
  body: string;
  /** Topic of the current step; selects the active tab. */
  topic: TutorialTopic;
  /** Zero-based index of the current step. */
  stepIndex: number;
  /** Total number of steps. */
  stepCount: number;
  /** Viewport geometry for the card; applied as inline style. */
  position: PopupPosition;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  /** Jump to a step by index (used by the topic tabs). */
  onGoToStep: (index: number) => void;
};

const TutorialPopupInner = ({
  title,
  body,
  topic,
  stepIndex,
  stepCount,
  position,
  onPrev,
  onNext,
  onClose,
  onGoToStep,
}: TutorialPopupProps): React.ReactElement => {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === stepCount - 1;

  const activeTab = TUTORIAL_TOPICS.findIndex((tab) => tab.topic === topic);

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, value: number): void => {
      const nextTopic = TUTORIAL_TOPICS[value].topic;
      const firstIndex = TUTORIAL_STEPS.findIndex(
        (step) => step.topic === nextTopic,
      );

      if (firstIndex !== -1) onGoToStep(firstIndex);
    },
    [onGoToStep],
  );

  return (
    <Box
      sx={rootSx}
      style={{
        top: position.top,
        left: position.left,
      }}
      role="dialog"
      aria-modal="true"
      data-testid="tutorial-popup"
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={tabsSx}
        data-testid="tutorial-topics"
      >
        {TUTORIAL_TOPICS.map((tab) => (
          <Tab
            key={tab.topic}
            label={tab.label}
            data-testid={`tutorial-topic--${tab.topic}`}
          />
        ))}
      </Tabs>

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
