import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputBase,
  ThemeProvider,
  Typography,
} from '@mui/material';

import { CustomSoundsDialog } from './components/CustomSoundsDialog';
import { MixerHeader } from './components/MixerHeader';
import { SaveLoadManager } from './components/SaveLoadManager';
import { TopBar } from './components/TopBar';
import { TrackGrid } from './components/TrackGrid';
import { MixLibrary } from './components/set/MixLibrary';
import { SetSection } from './components/set/SetSection';
import { SessionList } from './components/set/SessionList';
import { MixerProvider, useMixer } from './state/MixerContext';
import { SessionProvider, useSession } from './state/SessionContext';
import { retroTheme } from './theme';
import { STRINGS } from './strings';

const AppShell = (): React.ReactElement => {
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

  // Set playback coordination: when slot changes, load mix and set timer to advance
  useEffect(() => {
    if (!setIsPlaying || currentSlotIndex === null) return;
    const slot = activeSession.slots[currentSlotIndex];
    if (!slot) {
      sessionActions.stopSetPlayback();
      return;
    }

    void mixerActions.loadMixAndPlay(slot.mixId);

    const remaining = Math.max(0, slot.durationSeconds - slotOffsetSeconds);
    const timer = setTimeout(() => {
      const next = currentSlotIndex + 1;
      if (next < activeSession.slots.length) {
        sessionActions.advanceSlot();
      } else {
        sessionActions.stopSetPlayback();
        void mixerActions.toggleTransport();
      }
    }, remaining * 1000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsPlaying, currentSlotIndex, slotOffsetSeconds]);

  const handleSeek = (seconds: number) => {
    if (!setIsPlaying) return;
    const slots = activeSession.slots;
    let cumulative = 0;
    for (let i = 0; i < slots.length; i++) {
      if (seconds < cumulative + slots[i].durationSeconds) {
        sessionActions.seekToSlot(i, seconds - cumulative);
        return;
      }
      cumulative += slots[i].durationSeconds;
    }
  };

  const handleSetPlayPause = () => {
    if (setIsPlaying) {
      sessionActions.stopSetPlayback();
      void mixerActions.toggleTransport();
      return;
    }
    if (activeSession.slots.length === 0) return;
    sessionActions.startSetPlayback();
  };

  const handleSave = () => {
    if (activeMixId) {
      mixerActions.overwriteMix(activeMixId);
    } else {
      setSaveNewMixOpen(true);
    }
  };

  const handleSaveNew = () => {
    const defaultName = STRINGS.saveLoadManager.defaultMixName;
    setNewMixName(defaultName);
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
      {/* Top bar: app title + save/load set */}
      <TopBar
        onSaveSet={sessionActions.saveSession}
        onLoadSet={() => setLoadSetOpen(true)}
        onResetSet={sessionActions.resetSession}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main content: left sidebar + mixer + set */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar: mix library */}
        <Box
          sx={{
            width: '15rem',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            px: 1.5,
            py: 1.5,
          }}
        >
          <MixLibrary
            mixes={snapshot.savedMixes}
            activeMixId={activeMixId}
            playingMixId={playingMixId}
            isSetPlaybackActive={setIsPlaying}
            onToggleFavorite={mixerActions.toggleMixFavorite}
            onAddToTimeline={sessionActions.addSlot}
            onLoadMix={(mixId) => void mixerActions.loadMix(mixId)}
            onNewMix={() => void mixerActions.clearMix()}
          />
        </Box>

        {/* Right: mixer section + set section stacked */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Mixer header */}
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

          {/* Track grid */}
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
              onToggle={(trackId, enabled) =>
                void mixerActions.toggleTrack(trackId, enabled)
              }
              onPlay={(trackId) => void mixerActions.playTrackOnce(trackId)}
              onToggleFavorite={(trackId) => mixerActions.toggleFavorite(trackId)}
              onVolumeChange={(trackId, volume) =>
                mixerActions.setTrackVolume(trackId, volume)
              }
              onSpeedChange={(trackId, speed) =>
                mixerActions.setTrackSpeed(trackId, speed)
              }
              onEqChange={(trackId, eqLow, eqMid, eqHigh) =>
                mixerActions.setTrackEq(trackId, eqLow, eqMid, eqHigh)
              }
              onEffectsChange={(trackId, reverbSend, delaySend) =>
                mixerActions.setTrackEffects(trackId, reverbSend, delaySend)
              }
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
              onRestoreChanges={(trackId, settings) =>
                mixerActions.restoreTrackSettings(trackId, settings)
              }
              onSaveToTrack={(trackId, settings) =>
                mixerActions.saveTrackOverride(trackId, settings)
              }
            />
          </Box>

          {/* Set section (bottom) */}
          <SetSection
            activeSession={activeSession}
            mixes={snapshot.savedMixes}
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

      {/* Dialogs */}
      <CustomSoundsDialog
        open={customSoundsOpen}
        sounds={snapshot.customSounds}
        onClose={() => setCustomSoundsOpen(false)}
        onUpload={(file) => void mixerActions.addCustomSound(file)}
        onDelete={(soundId) => void mixerActions.deleteCustomSound(soundId)}
      />

      {/* Save new mix dialog */}
      <Dialog
        open={saveNewMixOpen}
        onClose={() => setSaveNewMixOpen(false)}
        PaperProps={{ sx: { bgcolor: 'background.paper', minWidth: '20rem' } }}
      >
        <DialogTitle
          sx={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', letterSpacing: '0.1em' }}
        >
          {STRINGS.saveLoadManager.saveMixTitle}
        </DialogTitle>
        <DialogContent>
          <InputBase
            autoFocus
            fullWidth
            value={newMixName}
            onChange={(e) => setNewMixName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSaveNew(); }}
            placeholder={STRINGS.saveLoadManager.mixNameLabel}
            sx={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.85rem',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              mt: 1,
              width: '100%',
            }}
          />
          <Typography
            sx={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: 'text.disabled', mt: 1 }}
          >
            {STRINGS.saveLoadManager.savesInfo}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={() => setSaveNewMixOpen(false)}
            sx={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem' }}
          >
            {STRINGS.saveLoadManager.cancel}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleConfirmSaveNew}
            disabled={!newMixName.trim()}
            sx={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem' }}
          >
            {STRINGS.saveLoadManager.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load set dialog */}
      <Dialog
        open={loadSetOpen}
        onClose={() => setLoadSetOpen(false)}
        PaperProps={{ sx: { bgcolor: 'background.paper', minWidth: '22rem' } }}
      >
        <DialogTitle
          sx={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', letterSpacing: '0.1em' }}
        >
          {STRINGS.topBar.loadSet}
        </DialogTitle>
        <DialogContent sx={{ px: 2, pb: 1 }}>
          <SessionList
            sessions={sessions}
            onLoad={(id) => {
              sessionActions.loadSession(id);
              setLoadSetOpen(false);
            }}
            onDelete={sessionActions.deleteSession}
            onToggleFavorite={sessionActions.toggleSessionFavorite}
          />
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={() => setLoadSetOpen(false)}
            sx={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem' }}
          >
            {STRINGS.saveLoadManager.close}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Legacy SaveLoadManager kept for mix load only (no longer used for save) */}
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

export const App = (): React.ReactElement => (
  <ThemeProvider theme={retroTheme}>
    <CssBaseline />
    <MixerProvider>
      <SessionProvider>
        <AppShell />
      </SessionProvider>
    </MixerProvider>
  </ThemeProvider>
);
