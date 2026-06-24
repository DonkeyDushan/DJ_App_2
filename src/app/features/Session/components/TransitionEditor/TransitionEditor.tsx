import {
  Box,
  InputBase,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import type { TransitionKind } from '../../../../core/types/transition';
import { STRINGS } from '../../../../strings';
import {
  MAX_TRANSITION_DURATION_SECONDS,
  MIN_TRANSITION_DURATION_SECONDS,
  TRANSITION_DURATION_STEP_SECONDS,
  TRANSITION_KINDS,
} from '../../constants/transitionOptions';
import {
  durationFieldSx,
  durationLabelSx,
  durationRowSx,
  editorRootSx,
  toggleButtonSx,
  toggleGroupSx,
} from './TransitionEditor.styles';

/** Visible label per transition kind. */
export const TRANSITION_KIND_LABEL: Record<TransitionKind, string> = {
  cut: STRINGS.set.transitionCut,
  fade: STRINGS.set.transitionFade,
  crossfade: STRINGS.set.transitionCrossfade,
};

interface TransitionEditorProps {
  kind: TransitionKind;
  durationSeconds: number;
  onChangeKind: (kind: TransitionKind) => void;
  onChangeDuration: (seconds: number) => void;
}

/**
 * Picks a transition kind and (for fade/crossfade) its duration. Shared by the
 * per-slot popover and the set-default control.
 */
export const TransitionEditor = ({
  kind,
  durationSeconds,
  onChangeKind,
  onChangeDuration,
}: TransitionEditorProps): React.ReactElement => {
  const isCut = kind === 'cut';

  const handleKind = (
    _event: React.MouseEvent<HTMLElement>,
    next: TransitionKind | null,
  ): void => {
    if (next !== null) onChangeKind(next);
  };

  const handleDuration = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(event.target.value, 10);
    if (Number.isNaN(value)) return;

    const clamped = Math.min(
      MAX_TRANSITION_DURATION_SECONDS,
      Math.max(MIN_TRANSITION_DURATION_SECONDS, value),
    );
    onChangeDuration(clamped);
  };

  return (
    <Box sx={editorRootSx} data-testid="transition-editor">
      <ToggleButtonGroup
        exclusive
        value={kind}
        onChange={handleKind}
        sx={toggleGroupSx}
      >
        {TRANSITION_KINDS.map((transitionKind) => (
          <ToggleButton
            key={transitionKind}
            value={transitionKind}
            sx={toggleButtonSx}
            data-testid={`transition-kind--${transitionKind}`}
          >
            {TRANSITION_KIND_LABEL[transitionKind]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Box sx={durationRowSx} data-disabled={isCut}>
        <InputBase
          type="number"
          value={durationSeconds}
          onChange={handleDuration}
          disabled={isCut}
          inputProps={{
            min: MIN_TRANSITION_DURATION_SECONDS,
            max: MAX_TRANSITION_DURATION_SECONDS,
            step: TRANSITION_DURATION_STEP_SECONDS,
          }}
          sx={durationFieldSx}
          data-testid="transition-duration-input"
        />
        <Typography sx={durationLabelSx}>{STRINGS.set.seconds}</Typography>
      </Box>
    </Box>
  );
};
