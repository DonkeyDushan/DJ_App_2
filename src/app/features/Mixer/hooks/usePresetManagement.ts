/**
 * Track preset and favourite management actions:
 * save, restore, delete presets; toggle track favourites; save track overrides.
 */

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { AudioEngine } from '../../../core/audio/audioEngine';
import {
  type PersistedTrackPreset,
  loadTrackOverrides,
  persistFavoriteIds,
  persistTrackOverrides,
  persistTrackPresets,
} from '../../../core/storage/trackPresets';
import type { MixerSnapshot } from '../../../core/types/mixData';
import type { TrackDefinition } from '../../../core/types/trackData';
import type { MixerActions } from '../types/mixerContext';
import {
  createDefaultSingleTrackState,
  mergeTrackState,
  presetToTrackDefinition,
} from '../utils/trackBuilders';

type PresetManagementParams = {
  engine: AudioEngine;
  snapshotRef: MutableRefObject<MixerSnapshot>;
  tracksRef: MutableRefObject<TrackDefinition[]>;
  favoriteIdsRef: MutableRefObject<Set<string>>;
  setSnapshot: Dispatch<SetStateAction<MixerSnapshot>>;
  setTracks: Dispatch<SetStateAction<TrackDefinition[]>>;
  setPresets: Dispatch<SetStateAction<PersistedTrackPreset[]>>;
  setFavoriteIds: Dispatch<SetStateAction<Set<string>>>;
};

export type PresetManagementActions = Pick<
  MixerActions,
  | 'saveTrackPreset'
  | 'restoreTrackSettings'
  | 'deleteTrackPreset'
  | 'toggleFavorite'
  | 'saveTrackOverride'
>;

export const buildPresetManagementActions = ({
  engine,
  snapshotRef,
  tracksRef,
  favoriteIdsRef,
  setSnapshot,
  setTracks,
  setPresets,
  setFavoriteIds,
}: PresetManagementParams): PresetManagementActions => ({
  saveTrackPreset: (
    sourceTrackId: string,
    name: string,
    category,
    settings,
    existingPresetId?: string,
  ): string => {
    const currentTracks = tracksRef.current;
    const currentFavoriteIds = favoriteIdsRef.current;
    const sourceTrack = currentTracks.find((t) => t.id === sourceTrackId);
    if (!sourceTrack) return existingPresetId ?? '';
    const generatedId =
      existingPresetId ??
      `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setPresets((current) => {
      let next: PersistedTrackPreset[];
      if (existingPresetId) {
        next = current.map((p) =>
          p.id === existingPresetId
            ? { ...p, name, category, savedSettings: settings }
            : p,
        );
      } else {
        const newPreset: PersistedTrackPreset = {
          id: generatedId,
          name,
          category,
          color: sourceTrack.color,
          loopLengthSeconds: sourceTrack.loopLengthSeconds,
          savedSettings: settings,
          sourceTrackId,
          preloadedSrc: sourceTrack.preloadedSrc,
          customSoundId: sourceTrack.customSoundId,
        };
        next = [...current, newPreset];
      }
      persistTrackPresets(next);
      const presetTracks = next.map((p) =>
        presetToTrackDefinition(p, currentFavoriteIds),
      );
      setTracks((currentTracks2) => {
        const baseTracks = currentTracks2.filter((t) => !t.sourceTrackId);

        return [...baseTracks, ...presetTracks];
      });
      setSnapshot((s) => ({
        ...s,
        trackStates: {
          ...s.trackStates,
          ...Object.fromEntries(
            presetTracks
              .filter((t) => !(t.id in s.trackStates))
              .map((t) => [t.id, createDefaultSingleTrackState(t.savedSettings)]),
          ),
        },
      }));

      return next;
    });

    return generatedId;
  },

  restoreTrackSettings: (trackId: string, settings) => {
    const currentSnapshot = snapshotRef.current;
    setSnapshot((current) => ({
      ...current,
      trackStates: mergeTrackState(current.trackStates, trackId, {
        volume: settings.volume,
        speed: settings.speed,
        followsGlobalTempo: settings.followsGlobalTempo,
        eqLow: settings.eqLow,
        eqMid: settings.eqMid,
        eqHigh: settings.eqHigh,
        reverbSend: settings.reverbSend,
        delaySend: settings.delaySend,
      }),
    }));
    engine.updateTrackVolume(trackId, settings.volume);
    engine.updateTrackRate(
      trackId,
      settings.followsGlobalTempo
        ? currentSnapshot.globalTempo
        : settings.speed,
    );
    engine.updateTrackEq(
      trackId,
      settings.eqLow,
      settings.eqMid,
      settings.eqHigh,
    );
    engine.updateTrackEffects(
      trackId,
      settings.reverbSend,
      settings.delaySend,
    );
  },

  deleteTrackPreset: (presetId: string) => {
    setPresets((current) => {
      const next = current.filter((p) => p.id !== presetId);
      persistTrackPresets(next);
      setTracks((currentTracks2) =>
        currentTracks2.filter((t) => t.id !== presetId),
      );
      setSnapshot((s) => {
        const nextStates = { ...s.trackStates };
        delete nextStates[presetId];

        return { ...s, trackStates: nextStates };
      });

      return next;
    });
  },

  toggleFavorite: (trackId: string) => {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      persistFavoriteIds(next);
      setTracks((currentTracks2) =>
        currentTracks2.map((t) =>
          t.id === trackId ? { ...t, isFavorite: next.has(trackId) } : t,
        ),
      );

      return next;
    });
  },

  saveTrackOverride: (trackId: string, settings) => {
    void loadTrackOverrides().then((current) => {
      persistTrackOverrides({ ...current, [trackId]: settings });
    });
  },
});
