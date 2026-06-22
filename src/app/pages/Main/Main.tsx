import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

import { STRINGS } from '../../../strings';
import {
  useMixer,
  MixerHeader,
  TrackGrid,
  MixLibrary,
  MixEditDialog,
} from '../../features/Mixer';
import { useSession, SetSection, SetLibrary } from '../../features/Session';
import type { MixColorKey } from '../../core';
import { CustomSoundsDialog } from '../../features/TrackEditing';
import {
  TopBar,
  SaveLoadManager,
  ConfirmDialog,
  NameInputDialog,
} from '../../components';
import { SaveMixDialog } from './components/SaveMixDialog/SaveMixDialog';
import { useSetPlayback } from './hooks/useSetPlayback';
import type { DeleteTarget, RenameTarget } from './types/libraryItemTarget';
import type { MixEditTarget } from './types/mixEditTarget';

/** Confirmation message shown for each kind of deletable library item. */
const DELETE_MESSAGE_BY_TYPE: Record<DeleteTarget['kind'], string> = {
  'track-preset': STRINGS.confirmDialog.deleteTrack,
  'custom-sound': STRINGS.confirmDialog.deleteSound,
  mix: STRINGS.confirmDialog.deleteMix,
  set: STRINGS.confirmDialog.deleteSet,
};

/** Dialog title shown for each kind of renameable library item. */
const RENAME_TITLE_BY_TYPE: Record<RenameTarget['kind'], string> = {
  'custom-sound': STRINGS.renameDialog.renameSoundTitle,
  set: STRINGS.renameDialog.renameSetTitle,
};

export const Main = (): React.ReactElement => {
  const { snapshot, tracks, activeMixId, actions: mixerActions } = useMixer();
  const {
    activeSession,
    sessions,
    setIsPlaying,
    currentSlotIndex,
    slotOffsetSeconds,
    playingMixId,
    hasUnsavedChanges,
    actions: sessionActions,
  } = useSession();

  const [customSoundsOpen, setCustomSoundsOpen] = useState(false);
  const [saveNewMixOpen, setSaveNewMixOpen] = useState(false);
  const [mixDialogInitialName, setMixDialogInitialName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [mixEditTarget, setMixEditTarget] = useState<MixEditTarget | null>(
    null,
  );

  // Lookup refs keep the request handlers referentially stable so memoized
  // library/grid subtrees do not re-render when unrelated snapshot state changes.
  const tracksLookupRef = useRef(tracks);
  tracksLookupRef.current = tracks;
  const soundsLookupRef = useRef(snapshot.customSounds);
  soundsLookupRef.current = snapshot.customSounds;
  const mixesLookupRef = useRef(snapshot.savedMixes);
  mixesLookupRef.current = snapshot.savedMixes;
  const sessionsLookupRef = useRef(sessions);
  sessionsLookupRef.current = sessions;

  const pendingActionsRef = useRef<{
    presetId: string;
    enablePreset: boolean;
    disableSourceId: string | null;
    playPreset: boolean;
  } | null>(null);
  const actionsRef = useRef(mixerActions);
  actionsRef.current = mixerActions;
  const activeMixIdRef = useRef(activeMixId);
  activeMixIdRef.current = activeMixId;

  useEffect(() => {
    if (!pendingActionsRef.current) return;
    const { presetId, enablePreset, disableSourceId, playPreset } =
      pendingActionsRef.current;
    const exists = tracks.some((t) => t.id === presetId);
    if (!exists) return;
    pendingActionsRef.current = null;
    if (disableSourceId)
      void actionsRef.current.toggleTrack(disableSourceId, false);
    if (enablePreset) void actionsRef.current.toggleTrack(presetId, true);
    if (playPreset) void actionsRef.current.playTrackOnce(presetId);
  }, [tracks]);

  const { handleSeek, handleSetPlayPause } = useSetPlayback({
    setIsPlaying,
    currentSlotIndex,
    slotOffsetSeconds,
    activeSession,
    mixerActions,
    sessionActions,
  });

  const handleSave = useCallback(() => {
    const mixId = activeMixIdRef.current;
    if (mixId) {
      mixerActions.overwriteMix(mixId);
    } else {
      setMixDialogInitialName('');
      setSaveNewMixOpen(true);
    }
  }, []);

  const handleSaveNew = useCallback(() => {
    setMixDialogInitialName(STRINGS.saveLoadManager.defaultMixName);
    setSaveNewMixOpen(true);
  }, []);

  const handleConfirmSaveNew = useCallback((name: string) => {
    if (name.trim()) {
      mixerActions.saveMix(name.trim());
    }
    setSaveNewMixOpen(false);
  }, []);

  const handleCloseSaveMixDialog = useCallback(
    () => setSaveNewMixOpen(false),
    [],
  );
  const handleOpenCustomSounds = useCallback(
    () => setCustomSoundsOpen(true),
    [],
  );
  const handleCloseCustomSounds = useCallback(
    () => setCustomSoundsOpen(false),
    [],
  );

  const handleLoadMix = useCallback(
    (mixId: string) => void mixerActions.loadMix(mixId),
    [],
  );
  const handleNewMix = useCallback(() => void mixerActions.clearMix(), []);
  const handleToggleTransport = useCallback(
    () => void mixerActions.toggleTransport(),
    [],
  );
  const handleTempoChange = useCallback(
    (tempo: number) => mixerActions.setGlobalTempo(tempo),
    [],
  );
  const handleResetMix = useCallback(() => void mixerActions.resetMix(), []);
  const handleUploadSound = useCallback(
    (file: File) => void mixerActions.addCustomSound(file),
    [],
  );

  const requestDeleteTrack = useCallback((trackId: string) => {
    const track = tracksLookupRef.current.find((t) => t.id === trackId);
    if (!track) return;

    if (track.sourceTrackId != null) {
      setDeleteTarget({ kind: 'track-preset', id: track.id, name: track.name });

      return;
    }

    if (track.kind === 'custom') {
      const soundId = track.customSoundId ?? track.id;
      const sound = soundsLookupRef.current.find((s) => s.id === soundId);
      setDeleteTarget({
        kind: 'custom-sound',
        id: soundId,
        name: sound?.name ?? track.name,
      });
    }
  }, []);

  const handleRenameTrack = useCallback(
    (trackId: string, name: string) => {
      const track = tracksLookupRef.current.find((t) => t.id === trackId);
      if (!track) return;

      if (track.sourceTrackId != null) {
        mixerActions.renameTrackPreset(track.id, name);

        return;
      }

      if (track.kind === 'custom') {
        const soundId = track.customSoundId ?? track.id;
        void mixerActions.renameCustomSound(soundId, name);
      }
    },
    [mixerActions],
  );

  const requestDeleteSound = useCallback((soundId: string) => {
    const sound = soundsLookupRef.current.find((s) => s.id === soundId);
    setDeleteTarget({
      kind: 'custom-sound',
      id: soundId,
      name: sound?.name ?? soundId,
    });
  }, []);

  const requestRenameSound = useCallback((soundId: string) => {
    const sound = soundsLookupRef.current.find((s) => s.id === soundId);
    setRenameTarget({
      kind: 'custom-sound',
      id: soundId,
      name: sound?.name ?? soundId,
    });
  }, []);

  const requestEditMix = useCallback((mixId: string) => {
    const mix = mixesLookupRef.current.find((m) => m.id === mixId);
    if (!mix) return;

    setMixEditTarget({ id: mixId, name: mix.name, color: mix.color ?? null });
  }, []);

  const requestDeleteSet = useCallback((sessionId: string) => {
    const session = sessionsLookupRef.current.find((s) => s.id === sessionId);
    setDeleteTarget({
      kind: 'set',
      id: sessionId,
      name: session?.name ?? sessionId,
    });
  }, []);

  const requestRenameSet = useCallback((sessionId: string) => {
    const session = sessionsLookupRef.current.find((s) => s.id === sessionId);
    setRenameTarget({ kind: 'set', id: sessionId, name: session?.name ?? '' });
  }, []);

  const handleCloseDelete = useCallback(() => setDeleteTarget(null), []);
  const handleCloseRename = useCallback(() => setRenameTarget(null), []);
  const handleCloseMixEdit = useCallback(() => setMixEditTarget(null), []);

  const handleSaveMixEdit = useCallback(
    (name: string, color: MixColorKey | null) => {
      setMixEditTarget((current) => {
        if (current) mixerActions.updateMix(current.id, { name, color });

        return null;
      });
    },
    [mixerActions],
  );

  const handleDeleteFromMixEdit = useCallback(() => {
    setMixEditTarget((current) => {
      if (current)
        setDeleteTarget({ kind: 'mix', id: current.id, name: current.name });

      return null;
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    switch (deleteTarget.kind) {
      case 'track-preset':
        mixerActions.deleteTrackPreset(deleteTarget.id);
        break;
      case 'custom-sound':
        void mixerActions.deleteCustomSound(deleteTarget.id);
        break;
      case 'mix':
        mixerActions.deleteMix(deleteTarget.id);
        break;
      case 'set':
        sessionActions.deleteSession(deleteTarget.id);
        break;
      default:
        break;
    }

    setDeleteTarget(null);
  }, [deleteTarget, mixerActions, sessionActions]);

  const handleConfirmRename = useCallback(
    (name: string) => {
      if (!renameTarget) return;

      switch (renameTarget.kind) {
        case 'custom-sound':
          void mixerActions.renameCustomSound(renameTarget.id, name);
          break;
        case 'set':
          sessionActions.renameSession(renameTarget.id, name);
          break;
        default:
          break;
      }

      setRenameTarget(null);
    },
    [renameTarget, mixerActions, sessionActions],
  );

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TopBar />

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <MixLibrary
          mixes={snapshot.savedMixes}
          activeMixId={activeMixId}
          playingMixId={playingMixId}
          isSetPlaybackActive={setIsPlaying}
          onAddToTimeline={sessionActions.addSlot}
          onLoadMix={handleLoadMix}
          onNewMix={handleNewMix}
          onEditMix={requestEditMix}
        />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <MixerHeader
            isPlaying={snapshot.transportPlaying}
            globalTempo={snapshot.globalTempo}
            activeMixId={activeMixId}
            isLocked={setIsPlaying}
            onToggleTransport={handleToggleTransport}
            onTempoChange={handleTempoChange}
            onReset={handleResetMix}
            onSave={handleSave}
            onSaveNew={handleSaveNew}
            onOpenCustomSounds={handleOpenCustomSounds}
          />

          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              px: 1.5,
              py: 1,
              pointerEvents: setIsPlaying ? 'none' : undefined,
              opacity: setIsPlaying ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <TrackGrid
              tracks={tracks}
              trackStates={snapshot.trackStates}
              onToggle={mixerActions.toggleTrack}
              onPlay={mixerActions.playTrackOnce}
              onToggleFavorite={mixerActions.toggleFavorite}
              onVolumeChange={mixerActions.setTrackVolume}
              onSpeedChange={mixerActions.setTrackSpeed}
              onEqChange={mixerActions.setTrackEq}
              onEffectsChange={mixerActions.setTrackEffects}
              onSaveAsNew={(
                editedTrackId,
                name,
                category,
                settings,
                originalSettings,
                wasPreviewPlaying,
              ) => {
                const editedTrack = tracks.find((t) => t.id === editedTrackId);
                const presetSourceTrackId =
                  editedTrack?.sourceTrackId ?? editedTrackId;
                const wasEnabled =
                  snapshot.trackStates[editedTrackId]?.enabled ?? false;
                const newPresetId = mixerActions.saveTrackPreset(
                  presetSourceTrackId,
                  name,
                  category,
                  settings,
                );
                mixerActions.restoreTrackSettings(
                  editedTrackId,
                  originalSettings,
                );
                if (wasPreviewPlaying) {
                  void mixerActions.playTrackOnce(editedTrackId);
                }
                pendingActionsRef.current = {
                  presetId: newPresetId,
                  enablePreset: wasEnabled,
                  disableSourceId: wasEnabled ? editedTrackId : null,
                  playPreset: wasPreviewPlaying,
                };
              }}
              onSaveOver={(presetId, name, category, settings) =>
                mixerActions.saveTrackPreset(
                  presetId,
                  name,
                  category,
                  settings,
                  presetId,
                )
              }
              onRestoreChanges={mixerActions.restoreTrackSettings}
              onSaveToTrack={mixerActions.saveTrackOverride}
              onRenameTrack={handleRenameTrack}
              onDeleteTrack={requestDeleteTrack}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flex: 0.6,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <SetLibrary
          sessions={sessions}
          activeSessionId={activeSession.id}
          isSetPlaybackActive={setIsPlaying}
          onLoad={sessionActions.loadSession}
          onDelete={requestDeleteSet}
          onRename={requestRenameSet}
          onNewSet={sessionActions.newSession}
        />

        <SetSection
          activeSession={activeSession}
          mixes={snapshot.savedMixes}
          tracks={tracks}
          isSetPlaying={setIsPlaying}
          currentSlotIndex={currentSlotIndex}
          hasUnsavedChanges={hasUnsavedChanges}
          onPlayPause={handleSetPlayPause}
          onSaveSet={sessionActions.saveSession}
          onResetSet={sessionActions.resetSession}
          onSetSessionName={sessionActions.setSessionName}
          onSetTotalDuration={sessionActions.setTotalDuration}
          onRemoveSlot={sessionActions.removeSlot}
          onDuplicateSlot={sessionActions.duplicateSlot}
          onSetSlotDuration={sessionActions.setSlotDuration}
          onReorderSlots={sessionActions.reorderSlots}
          onSeekSlot={handleSeek}
        />
      </Box>

      <CustomSoundsDialog
        open={customSoundsOpen}
        sounds={snapshot.customSounds}
        onClose={handleCloseCustomSounds}
        onUpload={handleUploadSound}
        onDelete={requestDeleteSound}
        onRename={requestRenameSound}
      />

      <SaveMixDialog
        open={saveNewMixOpen}
        initialName={mixDialogInitialName}
        onConfirm={handleConfirmSaveNew}
        onClose={handleCloseSaveMixDialog}
      />

      {/* Legacy SaveLoadManager kept for mix load only */}
      <SaveLoadManager
        saveOpen={false}
        loadOpen={false}
        mixes={snapshot.savedMixes}
        onClose={() => {}}
        onSave={(name) => mixerActions.saveMix(name)}
        onLoad={(mixId) => void mixerActions.loadMix(mixId)}
        onDelete={(mixId) => mixerActions.deleteMix(mixId)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={STRINGS.confirmDialog.deleteTitle}
        message={deleteTarget ? DELETE_MESSAGE_BY_TYPE[deleteTarget.kind] : ''}
        itemName={deleteTarget?.name}
        confirmLabel={STRINGS.confirmDialog.confirm}
        cancelLabel={STRINGS.confirmDialog.cancel}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDelete}
      />

      <NameInputDialog
        open={renameTarget !== null}
        title={renameTarget ? RENAME_TITLE_BY_TYPE[renameTarget.kind] : ''}
        initialName={renameTarget?.name ?? ''}
        placeholder={STRINGS.renameDialog.placeholder}
        confirmLabel={STRINGS.renameDialog.save}
        cancelLabel={STRINGS.renameDialog.cancel}
        onConfirm={handleConfirmRename}
        onClose={handleCloseRename}
      />

      <MixEditDialog
        open={mixEditTarget !== null}
        initialName={mixEditTarget?.name ?? ''}
        initialColor={mixEditTarget?.color ?? null}
        onSave={handleSaveMixEdit}
        onDelete={handleDeleteFromMixEdit}
        onClose={handleCloseMixEdit}
      />
    </Box>
  );
};
