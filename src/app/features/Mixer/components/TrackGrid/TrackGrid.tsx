import React, { useCallback, useRef, useState } from 'react';
import { useVirtualizer, defaultRangeExtractor } from '@tanstack/react-virtual';

import { Box, Stack, Typography } from '@mui/material';

import type { TrackCategory, TrackDefinition, TrackSavedSettings, TrackState } from '../../../../core/types/trackData';
import { STRINGS } from '../../../../strings';
import { TrackCard } from '../TrackCard/TrackCard';
import { TrackEditModal } from '../../../TrackEditing/components/TrackEditModal/TrackEditModal';
import {
  columnCountSx,
  columnHeaderSx,
  emptyColumnSx,
  gridSx,
} from './TrackGrid.styles';

/** Estimated height in px for a single track card row. */
const TRACK_CARD_ESTIMATE_PX = 48;

/** Gap in px between track card rows. */
const TRACK_CARD_GAP_PX = 6;

/** Overscan count for the vertical virtualizer — renders extra items above/below viewport. */
const VIRTUALIZER_OVERSCAN = 3;

const COLUMNS: { category: TrackCategory; label: string; color: string }[] = [
  { category: 'drums', label: STRINGS.trackGrid.drums, color: '#ff4fd8' },
  { category: 'arp', label: STRINGS.trackGrid.arp, color: '#40d9ff' },
  { category: 'bass', label: STRINGS.trackGrid.bass, color: '#40d9ff' },
  { category: 'keys', label: STRINGS.trackGrid.keys, color: '#40d9ff' },
  { category: 'pad', label: STRINGS.trackGrid.pad, color: '#6cff9f' },
  { category: 'custom', label: STRINGS.trackGrid.custom, color: '#ffd84f' },
];

/** Default track state used as a fallback when a track's state is missing. */
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
    settings: TrackSavedSettings,
    originalSettings: TrackSavedSettings,
    wasPreviewPlaying: boolean,
  ) => void;
  onSaveOver: (
    presetId: string,
    name: string,
    category: TrackCategory,
    settings: TrackSavedSettings,
  ) => void;
  onRestoreChanges: (
    trackId: string,
    settings: TrackSavedSettings,
  ) => void;
  onSaveToTrack: (
    trackId: string,
    settings: TrackSavedSettings,
  ) => void;
};

type VirtualTrackColumnProps = {
  columnTracks: TrackDefinition[];
  trackStates: Record<string, TrackState>;
  onToggle: (trackId: string, enabled: boolean) => void;
  onPlay: (trackId: string) => void;
  onEdit: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
};

const VirtualTrackColumn = React.memo(({
  columnTracks,
  trackStates,
  onToggle,
  onPlay,
  onEdit,
  onToggleFavorite,
}: VirtualTrackColumnProps): React.ReactElement => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getItemKey = useCallback((index: number) => columnTracks[index].id, [columnTracks]);

  const estimateSize = useCallback(() => TRACK_CARD_ESTIMATE_PX, []);

  const rangeExtractor = useCallback((range: Parameters<typeof defaultRangeExtractor>[0]) => {
    const containerTop = scrollRef.current?.getBoundingClientRect().top ?? 0;
    const scrollMargin = containerTop + window.scrollY;
    if (scrollMargin > window.scrollY + window.innerHeight) {
      return [];
    }

    return defaultRangeExtractor(range);
  }, []);

  const virtualizer = useVirtualizer({
    count: columnTracks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize,
    getItemKey,
    gap: TRACK_CARD_GAP_PX,
    overscan: VIRTUALIZER_OVERSCAN,
    rangeExtractor,
  });

  const maxCount = columnTracks.length;
  const minHeight = maxCount * TRACK_CARD_ESTIMATE_PX + Math.max(0, maxCount - 1) * TRACK_CARD_GAP_PX;

  return (
    <div
      ref={scrollRef}
      style={{ overflowY: 'auto', maxHeight: '100%' }}
      data-testid="track-column-scroll"
    >
      <div
        style={{ height: virtualizer.getTotalSize(), position: 'relative', minHeight }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const track = columnTracks[virtualItem.index];

          return (
            <div
              key={track.id}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TrackCard
                track={track}
                trackState={trackStates[track.id] ?? DEFAULT_TRACK_STATE}
                onToggle={onToggle}
                onPlay={onPlay}
                onEdit={onEdit}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualTrackColumn.displayName = 'VirtualTrackColumn';

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
      <Box sx={gridSx} data-testid="track-grid">
        {COLUMNS.map(({ category, label, color }) => {
          const columnTracks = grouped[category]
            .slice()
            .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

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

              {columnTracks.length === 0 ? (
                <Typography variant="caption" sx={emptyColumnSx}>
                  —
                </Typography>
              ) : (
                <Stack spacing={0.75}>
                  <VirtualTrackColumn
                    columnTracks={columnTracks}
                    trackStates={trackStates}
                    onToggle={onToggle}
                    onPlay={onPlay}
                    onEdit={setEditTrackId}
                    onToggleFavorite={onToggleFavorite}
                  />
                </Stack>
              )}
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
