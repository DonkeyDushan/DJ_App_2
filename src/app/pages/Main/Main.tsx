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
import { useSet, SetSection, SetLibrary, SetExportDialog } from '../../features/Set';
import type { MixColorKey } from '../../core';
import {
  useSessionDirty,
  activateSessionDirty,
  clearSessionDirty,
  saveSessionToFile,
  loadSessionFromFile,
  startNewSession,
} from '../../core';
import { CustomSoundsDialog, SoundTrimDialog } from '../../features/TrackEditing';
import { useTutorial, useTutorialAutoStart } from '../../features/Tutorial';
import {
  TopBar,
  SaveLoadManager,
  ConfirmDialog,
  NameInputDialog,
  UnsavedChangesDialog,
} from '../../components';
import { useSetPlayback } from './hooks/useSetPlayback';
import { useSetExport } from './hooks/useSetExport';
import type { DeleteTarget, RenameTarget } from './types/libraryItemTarget';
import type { MixDialogState } from './types/mixEditTarget';
import type { PendingMixSwitch } from './types/pendingMixSwitch';
import type { PendingSetSwitch } from './types/pendingSetSwitch';

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

/**
 * Delay after mount before the session dirty tracker is armed. Must exceed the
 * active-state persist debounce (500 ms) plus the initial async hydration so
 * the hydration write-back is not mistaken for a user change. Cleared again on
 * activation as a belt-and-braces guard.
 */
const SESSION_DIRTY_ACTIVATION_DELAY_MS = 1500;

/** Which discard-confirmation prompt the session controls are awaiting. */
type SessionConfirmKind = 'load' | 'new';

export const Main = (): React.ReactElement => {
  const {
    snapshot,
    tracks,
    activeMixId,
    isNewMix,
    hasUnsavedMixChanges,
    engine,
    actions: mixerActions,
  } = useMixer();
  const {
    activeSet,
    sets,
    setIsPlaying,
    currentSlotIndex,
    slotOffsetSeconds,
    playingMixId,
    hasUnsavedChanges,
    actions: setActions,
  } = useSet();

  const isDirty = useSessionDirty();

  const { start: startTutorial, currentStep: tutorialStep } = useTutorial();
  const tutorialStage = tutorialStep?.stage;

  const [customSoundsOpen, setCustomSoundsOpen] = useState(false);
  const [trimSoundId, setTrimSoundId] = useState<string | null>(null);
  const [mixDialog, setMixDialog] = useState<MixDialogState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [sessionConfirm, setSessionConfirm] = useState<SessionConfirmKind | null>(
    null,
  );
  const [pendingSwitch, setPendingSwitch] = useState<PendingMixSwitch | null>(
    null,
  );
  const [pendingSetSwitch, setPendingSetSwitch] =
    useState<PendingSetSwitch | null>(null);

  // Flips true once initial hydration has settled, gating any check that must
  // observe the fully loaded session rather than the empty default state.
  const [isSessionSettled, setIsSessionSettled] = useState(false);

  // Arm the session dirty tracker only after initial hydration settles, so the
  // restored state is treated as a clean, freshly opened session.
  useEffect(() => {
    const timer = setTimeout(() => {
      activateSessionDirty();
      clearSessionDirty();
      setIsSessionSettled(true);
    }, SESSION_DIRTY_ACTIVATION_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  // A "clear" session: nothing saved and nothing in progress. The mixer always
  // ships default tracks, so those are ignored; only user-created content and
  // active edits count. Used to auto-launch the tutorial for first-time users.
  const isSessionEmpty =
    snapshot.savedMixes.length === 0 &&
    snapshot.customSounds.length === 0 &&
    sets.length === 0 &&
    activeSet.slots.length === 0 &&
    activeMixId === null &&
    !tracks.some((track) => track.sourceTrackId != null) &&
    !Object.values(snapshot.trackStates).some((state) => state.enabled);

  useTutorialAutoStart(isSessionSettled && isSessionEmpty);

  // The tour drives the custom sounds dialog for its final step; opening it on
  // enter and closing it when the step is left (stage no longer matches).
  useEffect(() => {
    setCustomSoundsOpen(tutorialStage === 'customSounds');
  }, [tutorialStage]);

  // Number of tracks currently checked into the in-progress mix, shown on the
  // placeholder "Untitled" card that stands in for the unsaved working mix.
  const unsavedTrackCount = Object.values(snapshot.trackStates).filter(
    (state) => state.enabled,
  ).length;

  // The placeholder "Untitled" card is shown while building an unsaved mix:
  // either explicitly started via "New mix" (isNewMix), or by default when no
  // saved mixes exist yet. It is hidden once a mix is selected or saved, and
  // while a set is playing (the mixer is locked then).
  const showUnsavedCard =
    activeMixId === null &&
    !setIsPlaying &&
    (isNewMix || snapshot.savedMixes.length === 0);

  // The working set is a draft — never persisted — until its id appears in the
  // saved list. While it is a draft, the placeholder "Untitled" set card stands
  // in for it at the top of the set library.
  const isSetUnsaved = !sets.some((set) => set.id === activeSet.id);
  const unsavedSetSlotCount = activeSet.slots.length;
  const unsavedSetDurationSeconds = activeSet.slots.reduce(
    (sum, slot) => sum + slot.durationSeconds,
    0,
  );

  // Lookup refs keep the request handlers referentially stable so memoized
  // library/grid subtrees do not re-render when unrelated snapshot state changes.
  const tracksLookupRef = useRef(tracks);
  tracksLookupRef.current = tracks;
  const soundsLookupRef = useRef(snapshot.customSounds);
  soundsLookupRef.current = snapshot.customSounds;
  const mixesLookupRef = useRef(snapshot.savedMixes);
  mixesLookupRef.current = snapshot.savedMixes;
  const setsLookupRef = useRef(sets);
  setsLookupRef.current = sets;

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
  // Keeps the mix-switch handlers referentially stable while still reading the
  // latest dirty state, so the memoized MixLibrary does not re-render on every
  // track toggle.
  const hasUnsavedMixChangesRef = useRef(hasUnsavedMixChanges);
  hasUnsavedMixChangesRef.current = hasUnsavedMixChanges;
  // Same stable-handler pattern for the set library switch guard.
  const hasUnsavedSetChangesRef = useRef(hasUnsavedChanges);
  hasUnsavedSetChangesRef.current = hasUnsavedChanges;
  const activeSetIdRef = useRef(activeSet.id);
  activeSetIdRef.current = activeSet.id;

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
    activeSet,
    mixerActions,
    setActions,
  });

  const { isExporting, startExport, cancelExport } = useSetExport({
    engine,
    activeSet,
    setIsPlaying,
    startSetPlayback: setActions.startSetPlayback,
    stopSetPlayback: setActions.stopSetPlayback,
    toggleTransport: mixerActions.toggleTransport,
  });

  const handleExportSet = useCallback(() => void startExport(), [startExport]);

  const handleSaveSession = useCallback(() => void saveSessionToFile(), []);

  const performLoadSession = useCallback(async () => {
    const result = await loadSessionFromFile();
    if (result.loaded) {
      window.location.reload();

      return;
    }

    if (result.error) {
      window.alert(STRINGS.session.loadFailed);
    }
  }, []);

  const performNewSession = useCallback(async () => {
    await startNewSession();
    window.location.reload();
  }, []);

  const handleLoadSession = useCallback(() => {
    if (isDirty) {
      setSessionConfirm('load');

      return;
    }

    void performLoadSession();
  }, [isDirty, performLoadSession]);

  const handleNewSession = useCallback(() => {
    if (isDirty) {
      setSessionConfirm('new');

      return;
    }

    void performNewSession();
  }, [isDirty, performNewSession]);

  const handleConfirmSession = useCallback(() => {
    const action = sessionConfirm;
    setSessionConfirm(null);

    if (action === 'load') {
      void performLoadSession();
    } else if (action === 'new') {
      void performNewSession();
    }
  }, [sessionConfirm, performLoadSession, performNewSession]);

  const handleCloseSessionConfirm = useCallback(() => setSessionConfirm(null), []);

  const handleSave = useCallback(() => {
    const mixId = activeMixIdRef.current;
    if (mixId) {
      mixerActions.overwriteMix(mixId);
    } else {
      setMixDialog({ kind: 'create', initialName: '' });
    }
  }, []);

  const handleSaveNew = useCallback(() => {
    setMixDialog({
      kind: 'create',
      initialName: STRINGS.saveLoadManager.defaultMixName,
    });
  }, []);
  const handleOpenCustomSounds = useCallback(
    () => setCustomSoundsOpen(true),
    [],
  );
  const handleCloseCustomSounds = useCallback(
    () => setCustomSoundsOpen(false),
    [],
  );

  // Executes a requested mix switch immediately, bypassing the unsaved-changes
  // guard. Used once the user has resolved the prompt.
  const runMixSwitch = useCallback(
    (target: PendingMixSwitch) => {
      if (target.kind === 'load') {
        void mixerActions.loadMix(target.mixId);
      } else {
        void mixerActions.clearMix();
      }
    },
    [mixerActions],
  );

  const handleLoadMix = useCallback((mixId: string) => {
    // Reloading the already-active mix would silently discard unsaved edits;
    // it is a no-op instead (use Reset to revert deliberately).
    if (mixId === activeMixIdRef.current) return;

    if (hasUnsavedMixChangesRef.current) {
      setPendingSwitch({ kind: 'load', mixId });

      return;
    }

    void mixerActions.loadMix(mixId);
  }, []);

  const handleNewMix = useCallback(() => {
    if (hasUnsavedMixChangesRef.current) {
      setPendingSwitch({ kind: 'new' });

      return;
    }

    void mixerActions.clearMix();
  }, []);

  const handleCancelSwitch = useCallback(() => setPendingSwitch(null), []);

  const handleDiscardAndSwitch = useCallback(() => {
    if (pendingSwitch) runMixSwitch(pendingSwitch);

    setPendingSwitch(null);
  }, [pendingSwitch, runMixSwitch]);

  const handleSaveAndSwitch = useCallback(() => {
    const mixId = activeMixIdRef.current;
    if (mixId) mixerActions.overwriteMix(mixId);

    if (pendingSwitch) runMixSwitch(pendingSwitch);

    setPendingSwitch(null);
  }, [pendingSwitch, runMixSwitch]);

  // Defers the switch: opens the "save as new" dialog while keeping the pending
  // switch alive. Once the new mix is named and saved, the switch runs.
  const handleSaveNewAndSwitch = useCallback(() => {
    setMixDialog({
      kind: 'create',
      initialName: STRINGS.saveLoadManager.defaultMixName,
    });
  }, []);

  // --- Set library switch guard (mirrors the mix switch guard above) ---

  const runSetSwitch = useCallback(
    (target: PendingSetSwitch) => {
      if (target.kind === 'load') {
        setActions.loadSet(target.setId);
      } else {
        setActions.newSet();
      }
    },
    [setActions],
  );

  const handleLoadSet = useCallback(
    (setId: string) => {
      // Reloading the already-active set would silently discard unsaved edits;
      // no-op instead (use Reset to revert deliberately).
      if (setId === activeSetIdRef.current) return;

      if (hasUnsavedSetChangesRef.current) {
        setPendingSetSwitch({ kind: 'load', setId });

        return;
      }

      setActions.loadSet(setId);
    },
    [setActions],
  );

  const handleNewSet = useCallback(() => {
    if (hasUnsavedSetChangesRef.current) {
      setPendingSetSwitch({ kind: 'new' });

      return;
    }

    setActions.newSet();
  }, [setActions]);

  const handleCancelSetSwitch = useCallback(() => setPendingSetSwitch(null), []);

  const handleDiscardSetAndSwitch = useCallback(() => {
    if (pendingSetSwitch) runSetSwitch(pendingSetSwitch);

    setPendingSetSwitch(null);
  }, [pendingSetSwitch, runSetSwitch]);

  const handleSaveSetAndSwitch = useCallback(() => {
    setActions.saveSet();

    if (pendingSetSwitch) runSetSwitch(pendingSetSwitch);

    setPendingSetSwitch(null);
  }, [pendingSetSwitch, runSetSwitch, setActions]);
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

  const requestTrimSound = useCallback((soundId: string) => {
    setTrimSoundId(soundId);
  }, []);

  const handleCloseTrim = useCallback(() => setTrimSoundId(null), []);

  const handleSaveTrim = useCallback(
    (soundId: string, blob: Blob, mimeType: string) => {
      mixerActions
        .replaceCustomSound(soundId, blob, mimeType)
        .then(() => setTrimSoundId(null))
        .catch((error: unknown) => {
          console.error('[trim] Failed to save trimmed sound', error);
        });
    },
    [mixerActions],
  );

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

    setMixDialog({ kind: 'edit', id: mixId, name: mix.name, color: mix.color ?? null });
  }, []);

  const requestDeleteSet = useCallback((setId: string) => {
    const set = setsLookupRef.current.find((s) => s.id === setId);
    setDeleteTarget({
      kind: 'set',
      id: setId,
      name: set?.name ?? setId,
    });
  }, []);

  const requestRenameSet = useCallback((setId: string) => {
    const set = setsLookupRef.current.find((s) => s.id === setId);
    setRenameTarget({ kind: 'set', id: setId, name: set?.name ?? '' });
  }, []);

  const handleCloseDelete = useCallback(() => setDeleteTarget(null), []);
  const handleCloseRename = useCallback(() => setRenameTarget(null), []);
  // Closing the mix dialog also aborts any switch that was waiting on a
  // "save as new" — the user backed out, so they stay on the current mix.
  const handleCloseMixDialog = useCallback(() => {
    setMixDialog(null);
    setPendingSwitch(null);
  }, []);

  const handleSaveMixDialog = useCallback(
    (name: string, color: MixColorKey | null) => {
      if (!mixDialog) return;

      if (mixDialog.kind === 'create') {
        mixerActions.saveMix(name, color);
      } else {
        mixerActions.updateMix(mixDialog.id, { name, color });
      }

      setMixDialog(null);

      // When the save was triggered to resolve a pending mix switch, run it now
      // that the current work is safely persisted as a new mix.
      if (pendingSwitch) {
        runMixSwitch(pendingSwitch);
        setPendingSwitch(null);
      }
    },
    [mixDialog, mixerActions, pendingSwitch, runMixSwitch],
  );

  const handleDeleteFromMixEdit = useCallback(() => {
    if (mixDialog?.kind === 'edit')
      setDeleteTarget({ kind: 'mix', id: mixDialog.id, name: mixDialog.name });

    setMixDialog(null);
  }, [mixDialog]);

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
        setActions.deleteSet(deleteTarget.id);
        break;
      default:
        break;
    }

    setDeleteTarget(null);
  }, [deleteTarget, mixerActions, setActions]);

  const handleConfirmRename = useCallback(
    (name: string) => {
      if (!renameTarget) return;

      switch (renameTarget.kind) {
        case 'custom-sound':
          void mixerActions.renameCustomSound(renameTarget.id, name);
          break;
        case 'set':
          setActions.renameSet(renameTarget.id, name);
          break;
        default:
          break;
      }

      setRenameTarget(null);
    },
    [renameTarget, mixerActions, setActions],
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
      <TopBar
        isDirty={isDirty}
        onSaveSession={handleSaveSession}
        onLoadSession={handleLoadSession}
        onNewSession={handleNewSession}
        onOpenTutorial={startTutorial}
      />

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <MixLibrary
          mixes={snapshot.savedMixes}
          activeMixId={activeMixId}
          playingMixId={playingMixId}
          isSetPlaybackActive={setIsPlaying}
          showUnsavedCard={showUnsavedCard}
          unsavedTrackCount={unsavedTrackCount}
          onAddToTimeline={setActions.addSlot}
          onLoadMix={handleLoadMix}
          onNewMix={handleNewMix}
          onSaveUnsavedMix={handleSaveNew}
          onEditMix={requestEditMix}
          onDuplicateMix={mixerActions.duplicateMix}
        />

        <Box
          data-testid="mixer-panel"
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
            canSave={activeMixId !== null && hasUnsavedMixChanges}
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
              openTutorialEditor={tutorialStage === 'trackEditor'}
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
          sets={sets}
          activeSetId={activeSet.id}
          showUnsavedCard={isSetUnsaved}
          unsavedSlotCount={unsavedSetSlotCount}
          unsavedDurationSeconds={unsavedSetDurationSeconds}
          onLoad={handleLoadSet}
          onDelete={requestDeleteSet}
          onRename={requestRenameSet}
          onNewSet={handleNewSet}
          onSaveUnsavedSet={setActions.saveSet}
        />

        <SetSection
          activeSet={activeSet}
          mixes={snapshot.savedMixes}
          isSetPlaying={setIsPlaying}
          currentSlotIndex={currentSlotIndex}
          hasUnsavedChanges={hasUnsavedChanges}
          isExporting={isExporting}
          onPlayPause={handleSetPlayPause}
          onSaveSet={setActions.saveSet}
          onResetSet={setActions.resetSet}
          onExportSet={handleExportSet}
          onUpdateSetName={setActions.updateSetName}
          onSetTotalDuration={setActions.setTotalDuration}
          onRemoveSlot={setActions.removeSlot}
          onDuplicateSlot={setActions.duplicateSlot}
          onSetSlotDuration={setActions.setSlotDuration}
          onSetSlotTransitionKind={setActions.setSlotTransitionKind}
          onSetSlotTransitionDuration={setActions.setSlotTransitionDuration}
          onSetDefaultTransition={setActions.updateSetDefaultTransition}
          onReorderSlots={setActions.reorderSlots}
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
        onTrim={requestTrimSound}
      />

      <SoundTrimDialog
        open={trimSoundId !== null}
        sound={
          trimSoundId !== null
            ? snapshot.customSounds.find((s) => s.id === trimSoundId) ?? null
            : null
        }
        onClose={handleCloseTrim}
        onSave={handleSaveTrim}
      />


      {/* Legacy SaveLoadManager kept for mix load only */}
      <SaveLoadManager
        saveOpen={false}
        loadOpen={false}
        mixes={snapshot.savedMixes}
        onClose={() => {}}
        onSave={(name) => mixerActions.saveMix(name, null)}
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
        open={mixDialog !== null}
        mode={mixDialog?.kind ?? 'create'}
        initialName={mixDialog?.kind === 'edit' ? mixDialog.name : (mixDialog?.initialName ?? '')}
        initialColor={mixDialog?.kind === 'edit' ? mixDialog.color : null}
        onSave={handleSaveMixDialog}
        onDelete={mixDialog?.kind === 'edit' ? handleDeleteFromMixEdit : undefined}
        onClose={handleCloseMixDialog}
      />

      <UnsavedChangesDialog
        open={pendingSwitch !== null && mixDialog === null}
        title={STRINGS.unsavedMixDialog.title}
        message={STRINGS.unsavedMixDialog.message}
        discardLabel={STRINGS.unsavedMixDialog.discard}
        cancelLabel={STRINGS.unsavedMixDialog.cancel}
        onDiscard={handleDiscardAndSwitch}
        onClose={handleCancelSwitch}
        saveLabel={activeMixId !== null ? STRINGS.unsavedMixDialog.save : undefined}
        onSave={activeMixId !== null ? handleSaveAndSwitch : undefined}
        saveNewLabel={STRINGS.unsavedMixDialog.saveNew}
        onSaveNew={handleSaveNewAndSwitch}
      />

      <UnsavedChangesDialog
        open={pendingSetSwitch !== null}
        title={STRINGS.unsavedSetDialog.title}
        message={STRINGS.unsavedSetDialog.message}
        discardLabel={STRINGS.unsavedSetDialog.discard}
        cancelLabel={STRINGS.unsavedSetDialog.cancel}
        onDiscard={handleDiscardSetAndSwitch}
        onClose={handleCancelSetSwitch}
        saveLabel={STRINGS.unsavedSetDialog.save}
        onSave={handleSaveSetAndSwitch}
      />

      <ConfirmDialog
        open={sessionConfirm !== null}
        title={STRINGS.session.unsavedTitle}
        message={
          sessionConfirm === 'new'
            ? STRINGS.session.newMessage
            : STRINGS.session.loadMessage
        }
        confirmLabel={
          sessionConfirm === 'new'
            ? STRINGS.session.newConfirm
            : STRINGS.session.loadConfirm
        }
        cancelLabel={STRINGS.session.cancel}
        onConfirm={handleConfirmSession}
        onClose={handleCloseSessionConfirm}
      />

      <SetExportDialog open={isExporting} onCancel={cancelExport} />
    </Box>
  );
};
