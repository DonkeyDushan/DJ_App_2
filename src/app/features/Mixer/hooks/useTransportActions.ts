/**
 * Transport and real-time parameter actions for the mixer.
 * Covers: track enable/disable, one-shot preview, volume/speed/EQ/effects sliders,
 * global tempo, and transport start/stop/restart.
 */

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { AudioEngine } from '../../../core/audio/audioEngine';
import type { MixerSnapshot } from '../../../core/types/mixData';
import type { TrackDefinition } from '../../../core/types/trackData';
import type { MixerActions } from '../types/mixerContext';
import { mergeTrackState } from '../utils/trackBuilders';

type TransportActionsParams = {
  engine: AudioEngine;
  snapshotRef: MutableRefObject<MixerSnapshot>;
  tracksRef: MutableRefObject<TrackDefinition[]>;
  setSnapshot: Dispatch<SetStateAction<MixerSnapshot>>;
};

export type TransportActions = Pick<
  MixerActions,
  | 'toggleTrack'
  | 'playTrackOnce'
  | 'setTrackVolume'
  | 'setTrackSpeed'
  | 'setTrackEq'
  | 'setTrackEffects'
  | 'setGlobalTempo'
  | 'toggleTransport'
  | 'restartTransport'
>;

export const buildTransportActions = ({
  engine,
  snapshotRef,
  tracksRef,
  setSnapshot,
}: TransportActionsParams): TransportActions => ({
  toggleTrack: async (trackId: string, enabled: boolean) => {
    const currentSnapshot = snapshotRef.current;
    const currentTracks = tracksRef.current;
    setSnapshot((current) => ({
      ...current,
      trackStates: mergeTrackState(current.trackStates, trackId, { enabled }),
    }));

    const track = currentTracks.find((entry) => entry.id === trackId);
    const state = currentSnapshot.trackStates[trackId];
    if (!track || !state) return;

    const nextState = { ...state, enabled };
    await engine.syncTrack(
      track,
      nextState,
      currentSnapshot.customSounds,
      currentSnapshot.globalTempo,
    );
  },

  playTrackOnce: async (trackId: string) => {
    const currentSnapshot = snapshotRef.current;
    const currentTracks = tracksRef.current;
    if (currentSnapshot.transportPlaying) return;

    const track = currentTracks.find((entry) => entry.id === trackId);
    const state = currentSnapshot.trackStates[trackId];
    if (!track || !state) return;

    await engine.playTrackOnce(
      track,
      state,
      currentSnapshot.customSounds,
      currentSnapshot.globalTempo,
    );
  },

  setTrackVolume: (trackId: string, volume: number) => {
    setSnapshot((current) => ({
      ...current,
      trackStates: mergeTrackState(current.trackStates, trackId, { volume }),
    }));
    engine.updateTrackVolume(trackId, volume);
  },

  setTrackSpeed: (trackId: string, speed: number) => {
    const currentSnapshot = snapshotRef.current;
    const followsGlobalTempo =
      Math.abs(speed - currentSnapshot.globalTempo) < 0.001;
    setSnapshot((current) => ({
      ...current,
      trackStates: mergeTrackState(current.trackStates, trackId, {
        speed,
        followsGlobalTempo,
      }),
    }));
    engine.updateTrackRate(
      trackId,
      followsGlobalTempo ? currentSnapshot.globalTempo : speed,
    );
  },

  setTrackEq: (
    trackId: string,
    eqLow: number,
    eqMid: number,
    eqHigh: number,
  ) => {
    setSnapshot((current) => ({
      ...current,
      trackStates: mergeTrackState(current.trackStates, trackId, {
        eqLow,
        eqMid,
        eqHigh,
      }),
    }));
    engine.updateTrackEq(trackId, eqLow, eqMid, eqHigh);
  },

  setTrackEffects: (
    trackId: string,
    reverbSend: number,
    delaySend: number,
  ) => {
    setSnapshot((current) => ({
      ...current,
      trackStates: mergeTrackState(current.trackStates, trackId, {
        reverbSend,
        delaySend,
      }),
    }));
    engine.updateTrackEffects(trackId, reverbSend, delaySend);
  },

  setGlobalTempo: (tempo: number) => {
    const currentSnapshot = snapshotRef.current;
    setSnapshot((current) => ({
      ...current,
      globalTempo: tempo,
      trackStates: Object.fromEntries(
        Object.entries(current.trackStates).map(([trackId, trackState]) => [
          trackId,
          {
            ...trackState,
            followsGlobalTempo:
              trackState.followsGlobalTempo ||
              Math.abs(trackState.speed - tempo) < 0.001,
          },
        ]),
      ),
    }));
    Object.entries(currentSnapshot.trackStates).forEach(
      ([trackId, trackState]) => {
        engine.updateTrackRate(
          trackId,
          trackState.followsGlobalTempo ? tempo : trackState.speed,
        );
      },
    );
  },

  toggleTransport: async () => {
    const currentSnapshot = snapshotRef.current;
    const currentTracks = tracksRef.current;
    if (currentSnapshot.transportPlaying) {
      await engine.stopTransport(true);
      setSnapshot((current) => ({
        ...current,
        transportPlaying: false,
        trackStates: Object.fromEntries(
          Object.entries(current.trackStates).map(
            ([trackId, trackState]) => [
              trackId,
              { ...trackState, isPlaying: false, isPreviewPlaying: false },
            ],
          ),
        ),
      }));

      return;
    }

    await engine.startTransport(
      currentTracks,
      currentSnapshot.trackStates,
      currentSnapshot.customSounds,
      currentSnapshot.globalTempo,
    );
    setSnapshot((current) => ({
      ...current,
      transportPlaying: true,
      trackStates: Object.fromEntries(
        Object.entries(current.trackStates).map(([trackId, trackState]) => [
          trackId,
          {
            ...trackState,
            isPlaying: trackState.enabled,
            isPreviewPlaying: false,
          },
        ]),
      ),
    }));
  },

  restartTransport: async () => {
    const currentSnapshot = snapshotRef.current;
    const currentTracks = tracksRef.current;
    await engine.restartTransport(
      currentTracks,
      currentSnapshot.trackStates,
      currentSnapshot.customSounds,
      currentSnapshot.globalTempo,
    );
    setSnapshot((current) => ({
      ...current,
      transportPlaying: true,
      trackStates: Object.fromEntries(
        Object.entries(current.trackStates).map(([trackId, trackState]) => [
          trackId,
          {
            ...trackState,
            isPlaying: trackState.enabled,
            isPreviewPlaying: false,
          },
        ]),
      ),
    }));
  },
});
