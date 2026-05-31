import { Grid } from '@mui/material';

import type { TrackDefinition, TrackState } from '../types';
import { TrackItem } from './TrackItem';

type TrackListProps = {
  tracks: TrackDefinition[];
  trackStates: Record<string, TrackState>;
  onToggle: (trackId: string, enabled: boolean) => void;
  onPlay: (trackId: string) => void;
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
};

export function TrackList({
  tracks,
  trackStates,
  onToggle,
  onPlay,
  onVolumeChange,
  onSpeedChange,
  onEqChange,
  onEffectsChange,
}: TrackListProps): React.ReactElement {
  return (
    <Grid container spacing={2}>
      {tracks.map((track, i) => (
        <Grid key={track.id ?? i} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
          <TrackItem
            track={track}
            trackState={
              trackStates[track.id] ?? {
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
              }
            }
            onToggle={onToggle}
            onPlay={onPlay}
            onVolumeChange={onVolumeChange}
            onSpeedChange={onSpeedChange}
            onEqChange={onEqChange}
            onEffectsChange={onEffectsChange}
          />
        </Grid>
      ))}
    </Grid>
  );
}
