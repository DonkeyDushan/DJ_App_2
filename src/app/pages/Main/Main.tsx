import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

import { STRINGS } from '../../../strings';
import { useMixer, MixerHeader, TrackGrid } from '../../features/Mixer';
import { useSession, SetSection, SetLibrary } from '../../features/Session';
import { CustomSoundsDialog } from '../../features/TrackEditing';
import { TopBar, SaveLoadManager } from '../../components';
import { SaveMixDialog } from './components/SaveMixDialog/SaveMixDialog';
import { MixLibrarySidebar } from './components/MixLibrarySidebar/MixLibrarySidebar';
import { useSetPlayback } from './hooks/useSetPlayback';

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

  const handleCloseSaveMixDialog = useCallback(() => setSaveNewMixOpen(false), []);
  const handleOpenCustomSounds = useCallback(() => setCustomSoundsOpen(true), []);
  const handleCloseCustomSounds = useCallback(() => setCustomSoundsOpen(false), []);

  const handleLoadMix = useCallback((mixId: string) => void mixerActions.loadMix(mixId), []);
  const handleNewMix = useCallback(() => void mixerActions.clearMix(), []);
  const handleToggleTransport = useCallback(() => void mixerActions.toggleTransport(), []);
  const handleTempoChange = useCallback((tempo: number) => mixerActions.setGlobalTempo(tempo), []);
  const handleResetMix = useCallback(() => void mixerActions.resetMix(), []);
  const handleUploadSound = useCallback((file: File) => void mixerActions.addCustomSound(file), []);
  const handleDeleteSound = useCallback((soundId: string) => mixerActions.deleteCustomSound(soundId), []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar />

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <MixLibrarySidebar
          mixes={snapshot.savedMixes}
          activeMixId={activeMixId}
          playingMixId={playingMixId}
          isSetPlaybackActive={setIsPlaying}
          onToggleFavorite={mixerActions.toggleMixFavorite}
          onAddToTimeline={sessionActions.addSlot}
          onLoadMix={handleLoadMix}
          onNewMix={handleNewMix}
        />

        <Box
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}
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
              overflow: 'auto',
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
                mixerActions.restoreTrackSettings(editedTrackId, originalSettings);
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
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <SetLibrary
          sessions={sessions}
          activeSessionId={activeSession.id}
          isSetPlaybackActive={setIsPlaying}
          onLoad={sessionActions.loadSession}
          onDelete={sessionActions.deleteSession}
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
          onAddSlot={sessionActions.addSlot}
          onReorderSlots={sessionActions.reorderSlots}
          onSeekSlot={handleSeek}
        />
      </Box>

      <CustomSoundsDialog
        open={customSoundsOpen}
        sounds={snapshot.customSounds}
        onClose={handleCloseCustomSounds}
        onUpload={handleUploadSound}
        onDelete={handleDeleteSound}
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
    </Box>
  );
};
