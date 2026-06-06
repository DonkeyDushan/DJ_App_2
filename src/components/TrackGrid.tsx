import React, { useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import type { TrackCategory, TrackDefinition, TrackState } from '../types';
import { STRINGS } from '../strings';
import { TrackCard } from './TrackCard';
import { TrackEditModal } from './TrackEditModal';
import {
  columnCountSx,
  columnHeaderSx,
  emptyColumnSx,
  gridSx,
} from './TrackGrid.styles';

const COLUMNS: { category: TrackCategory; label: string; color: string }[] = [
  { category: 'drums', label: STRINGS.trackGrid.drums, color: '#ff4fd8' },
  { category: 'arp', label: STRINGS.trackGrid.arp, color: '#40d9ff' },
  { category: 'bass', label: STRINGS.trackGrid.bass, color: '#40d9ff' },
  { category: 'keys', label: STRINGS.trackGrid.keys, color: '#40d9ff' },
  { category: 'pad', label: STRINGS.trackGrid.pad, color: '#6cff9f' },
  { category: 'custom', label: STRINGS.trackGrid.custom, color: '#ffd84f' },
];

type TrackGridProps = {
  tracks: TrackDefinition[];
  trackStates: Record<string, TrackState>;
  onToggle: (trackId: string, enabled: boolean) => void;
  onPlay: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
  onSpeedChange: (trackId: string, speed: number) => void;
  onEqChange: (
    trackId: string,
    eqLow: number,
    eqMid: number,
    eqHigh: number,
  ) => void;
  onEffectsChange: (
    trackId: string,
    reverbSend: number,
    delaySend: number,
  ) => void;
  onSaveAsNew: (
    sourceTrackId: string,
    name: string,
    category: TrackCategory,
    settings: import('../types').TrackSavedSettings,
    originalSettings: import('../types').TrackSavedSettings,
    wasPreviewPlaying: boolean,
  ) => void;
  onSaveOver: (
    presetId: string,
    name: string,
    category: TrackCategory,
    settings: import('../types').TrackSavedSettings,
  ) => void;
  onRestoreChanges: (
    trackId: string,
    settings: import('../types').TrackSavedSettings,
  ) => void;
  onSaveToTrack: (
    trackId: string,
    settings: import('../types').TrackSavedSettings,
  ) => void;
};

const DEFAULT_TRACK_STATE: TrackState = {
  enabled: false,
  volume: 0.78,
  speed: 1,
  followsGlobalTempo: true,
  eqLow: 0,
  eqMid: 0,
  eqHigh: 0,
  reverbSend: 0,
  delaySend: 0,
  isPlaying: false,
  isPreviewPlaying: false,
};

export const TrackGrid = ({
  tracks,
  trackStates,
  onToggle,
  onPlay,
  onToggleFavorite,
  onVolumeChange,
  onSpeedChange,
  onEqChange,
  onEffectsChange,
  onSaveAsNew,
  onSaveOver,
  onRestoreChanges,
  onSaveToTrack,
}: TrackGridProps): React.ReactElement => {
  const [editTrackId, setEditTrackId] = useState<string | null>(null);

  const editTrack = tracks.find((t) => t.id === editTrackId) ?? null;
  const editTrackState = editTrackId
    ? (trackStates[editTrackId] ?? DEFAULT_TRACK_STATE)
    : null;

  // Group tracks by category; "other" goes into the custom column
  const grouped: Record<TrackCategory, TrackDefinition[]> = {
    drums: [],
    arp: [],
    bass: [],
    keys: [],
    pad: [],
    custom: [],
    other: [],
  };
  for (const track of tracks) {
    grouped[track.category].push(track);
  }
  // Overflow "other" into custom column
  grouped.custom.push(...grouped.other);

  return (
    <>
      <Box sx={gridSx}>
        {COLUMNS.map(({ category, label, color }) => {
          const columnTracks = grouped[category];
          return (
            <Box key={category}>
              <Typography
                variant="caption"
                sx={columnHeaderSx(color)}
              >
                {label}
                <Typography component="span" sx={columnCountSx}>
                  ({columnTracks.length})
                </Typography>
              </Typography>

              <Stack spacing={0.75}>
                {columnTracks.length === 0 ? (
                  <Typography variant="caption" sx={emptyColumnSx}>
                    —
                  </Typography>
                ) : (
                  columnTracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      trackState={trackStates[track.id] ?? DEFAULT_TRACK_STATE}
                      onToggle={onToggle}
                      onPlay={onPlay}
                      onEdit={(id) => setEditTrackId(id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>

      <TrackEditModal
        open={editTrackId !== null}
        track={editTrack}
        trackState={editTrackState}
        onClose={() => setEditTrackId(null)}
        onSaveAsNew={onSaveAsNew}
        onSaveOver={onSaveOver}
        onRestoreChanges={onRestoreChanges}
        onVolumeChange={onVolumeChange}
        onSaveToTrack={onSaveToTrack}
        onSpeedChange={onSpeedChange}
        onEqChange={onEqChange}
        onEffectsChange={onEffectsChange}
      />
    </>
  );
};
