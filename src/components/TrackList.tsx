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
};

export function TrackList({ tracks, trackStates, onToggle, onPlay, onVolumeChange, onSpeedChange }: TrackListProps): React.ReactElement {
  return (
    <Grid container spacing={2}>
      {tracks.map((track) => (
        <Grid key={track.id} item xs={12} sm={6} lg={4} xl={3}>
          <TrackItem
            track={track}
            trackState={trackStates[track.id] ?? {
              enabled: false,
              volume: 0.78,
              speed: 1,
              followsGlobalTempo: true,
              isPlaying: false,
              isPreviewPlaying: false,
            }}
            onToggle={onToggle}
            onPlay={onPlay}
            onVolumeChange={onVolumeChange}
            onSpeedChange={onSpeedChange}
          />
        </Grid>
      ))}
    </Grid>
  );
}
