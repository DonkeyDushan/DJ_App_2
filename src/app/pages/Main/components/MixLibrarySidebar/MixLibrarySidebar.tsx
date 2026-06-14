import React from 'react';
import { Box } from '@mui/material';

import type { SavedMix } from '../../../../core/types/mixData';
import { MixLibrary } from '../../../../features/Session';
import { sidebarSx } from './MixLibrarySidebar.styles';

type MixLibrarySidebarProps = {
  mixes: SavedMix[];
  activeMixId: string | null;
  playingMixId: string | null;
  isSetPlaybackActive: boolean;
  onToggleFavorite: (mixId: string) => void;
  onAddToTimeline: (mixId: string) => void;
  onLoadMix: (mixId: string) => void;
  onNewMix: () => void;
};

export const MixLibrarySidebar = ({
  mixes,
  activeMixId,
  playingMixId,
  isSetPlaybackActive,
  onToggleFavorite,
  onAddToTimeline,
  onLoadMix,
  onNewMix,
}: MixLibrarySidebarProps): React.ReactElement => (
  <Box sx={sidebarSx}>
    <MixLibrary
      mixes={mixes}
      activeMixId={activeMixId}
      playingMixId={playingMixId}
      isSetPlaybackActive={isSetPlaybackActive}
      onToggleFavorite={onToggleFavorite}
      onAddToTimeline={onAddToTimeline}
      onLoadMix={onLoadMix}
      onNewMix={onNewMix}
    />
  </Box>
);
