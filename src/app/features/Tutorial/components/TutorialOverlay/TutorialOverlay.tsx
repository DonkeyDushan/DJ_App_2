import React from 'react';
import { createPortal } from 'react-dom';
import { Box } from '@mui/material';

import { useTutorial } from '../../TutorialContext';
import { useTargetRect } from '../../hooks/useTargetRect';
import { useTutorialKeyboard } from '../../hooks/useTutorialKeyboard';
import { computePopupPosition } from '../../utils/computePopupPosition';
import { SPOTLIGHT_PADDING_PX } from '../../constants/tutorialLayout';
import type { TargetRect } from '../../types/targetRect';
import { TutorialPopup } from '../TutorialPopup/TutorialPopup';
import { backdropSx, curtainSx, ringSx } from './TutorialOverlay.styles';

/**
 * Expands a rect by `padding` on all sides and clamps it into the viewport, so
 * the spotlight hole never extends past the screen edges (which would leave a
 * curtain with negative size).
 */
const padRect = (rect: TargetRect, padding: number): TargetRect => {
  const top = Math.max(0, rect.top - padding);
  const left = Math.max(0, rect.left - padding);
  const right = Math.min(window.innerWidth, rect.left + rect.width + padding);
  const bottom = Math.min(window.innerHeight, rect.top + rect.height + padding);

  return { top, left, width: right - left, height: bottom - top };
};

/**
 * Renders the guided-tour overlay into a body portal while a tour is active:
 * a four-curtain dark mask that leaves the highlighted element uncovered and
 * interactive, a neon ring around it, and the instruction popup. Target-less
 * steps fall back to a plain backdrop with a centered popup.
 */
export const TutorialOverlay = (): React.ReactElement | null => {
  const { isActive, currentStep, stepIndex, stepCount, next, prev, stop } =
    useTutorial();

  useTutorialKeyboard(isActive, { onNext: next, onPrev: prev, onClose: stop });

  const rawRect = useTargetRect(currentStep?.targetSelector ?? null);

  if (!isActive || currentStep === null) return null;

  const hole =
    rawRect === null
      ? null
      : padRect(rawRect, currentStep.paddingPx ?? SPOTLIGHT_PADDING_PX);

  const position = computePopupPosition(hole, currentStep.placement);

  const popup = (
    <TutorialPopup
      title={currentStep.title}
      body={currentStep.body}
      stepIndex={stepIndex}
      stepCount={stepCount}
      position={position}
      onPrev={prev}
      onNext={next}
      onClose={stop}
    />
  );

  // No resolvable target: dim the whole screen and center the popup.
  if (hole === null) {
    return createPortal(
      <>
        <Box sx={backdropSx} data-testid="tutorial-backdrop" />
        {popup}
      </>,
      document.body,
    );
  }

  const holeRight = hole.left + hole.width;
  const holeBottom = hole.top + hole.height;

  return createPortal(
    <>
      {/* Four curtains tiling the viewport around the spotlight hole. */}
      <Box
        sx={curtainSx}
        style={{ top: 0, left: 0, right: 0, height: hole.top }}
      />
      <Box
        sx={curtainSx}
        style={{ top: holeBottom, left: 0, right: 0, bottom: 0 }}
      />
      <Box
        sx={curtainSx}
        style={{
          top: hole.top,
          left: 0,
          width: hole.left,
          height: hole.height,
        }}
      />
      <Box
        sx={curtainSx}
        style={{
          top: hole.top,
          left: holeRight,
          right: 0,
          height: hole.height,
        }}
      />

      {/* Decorative neon ring around the interactive hole. */}
      <Box
        sx={ringSx}
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
        }}
        data-testid="tutorial-spotlight"
      />

      {popup}
    </>,
    document.body,
  );
};
