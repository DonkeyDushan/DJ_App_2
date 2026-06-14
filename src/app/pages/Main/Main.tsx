import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

import { STRINGS } from '../../../strings';
import { useMixer, MixerHeader, TrackGrid } from '../../features/Mixer';
import { useSession, SetSection } from '../../features/Session';
import { CustomSoundsDialog } from '../../features/TrackEditing';
import { TopBar, SaveLoadManager } from '../../components';
import { SaveMixDialog } from './components/SaveMixDialog/SaveMixDialog';
import { LoadSetDialog } from './components/LoadSetDialog/LoadSetDialog';
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
  const [newMixName, setNewMixName] = useState('');
  const [loadSetOpen, setLoadSetOpen] = useState(false);

  const pendingActionsRef = useRef<{
    presetId: string;
    enablePreset: boolean;
    disableSourceId: string | null;
    playPreset: boolean;
  } | null>(null);
  const actionsRef = useRef(mixerActions);
  actionsRef.current = mixerActions;

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

  const handleSave = () => {
    if (activeMixId) {
      mixerActions.overwriteMix(activeMixId);
    } else {
      setSaveNewMixOpen(true);
    }
  };

  const handleSaveNew = () => {
    setNewMixName(STRINGS.saveLoadManager.defaultMixName);
    setSaveNewMixOpen(true);
  };

  const handleConfirmSaveNew = () => {
    if (newMixName.trim()) {
      mixerActions.saveMix(newMixName.trim());
    }
    setSaveNewMixOpen(false);
    setNewMixName('');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar
        onSaveSet={sessionActions.saveSession}
        onLoadSet={() => setLoadSetOpen(true)}
        onResetSet={sessionActions.resetSession}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <MixLibrarySidebar
          mixes={snapshot.savedMixes}
          activeMixId={activeMixId}
          playingMixId={playingMixId}
          isSetPlaybackActive={setIsPlaying}
          onToggleFavorite={mixerActions.toggleMixFavorite}
          onAddToTimeline={sessionActions.addSlot}
          onLoadMix={(mixId) => void mixerActions.loadMix(mixId)}
          onNewMix={() => void mixerActions.clearMix()}
        />

        <Box
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}
        >
          <MixerHeader
            isPlaying={snapshot.transportPlaying}
            globalTempo={snapshot.globalTempo}
            activeMixId={activeMixId}
            isLocked={setIsPlaying}
            onToggleTransport={() => void mixerActions.toggleTransport()}
            onTempoChange={(tempo) => mixerActions.setGlobalTempo(tempo)}
            onReset={() => void mixerActions.resetMix()}
            onSave={handleSave}
            onSaveNew={handleSaveNew}
            onOpenCustomSounds={() => setCustomSoundsOpen(true)}
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

          <SetSection
            activeSession={activeSession}
            mixes={snapshot.savedMixes}
            tracks={tracks}
            isSetPlaying={setIsPlaying}
            currentSlotIndex={currentSlotIndex}
            onPlayPause={handleSetPlayPause}
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
      </Box>

      <CustomSoundsDialog
        open={customSoundsOpen}
        sounds={snapshot.customSounds}
        onClose={() => setCustomSoundsOpen(false)}
        onUpload={(file) => void mixerActions.addCustomSound(file)}
        onDelete={(soundId) => void mixerActions.deleteCustomSound(soundId)}
      />

      <SaveMixDialog
        open={saveNewMixOpen}
        mixName={newMixName}
        onMixNameChange={setNewMixName}
        onConfirm={handleConfirmSaveNew}
        onClose={() => setSaveNewMixOpen(false)}
      />

      <LoadSetDialog
        open={loadSetOpen}
        sessions={sessions}
        onLoad={sessionActions.loadSession}
        onDelete={sessionActions.deleteSession}
        onToggleFavorite={sessionActions.toggleSessionFavorite}
        onClose={() => setLoadSetOpen(false)}
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
