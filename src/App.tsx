import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
} from '@mui/material';

import { GlobalControls } from './components/GlobalControls';
import { GlobalTempoPanel } from './components/GlobalTempoPanel';
import { CustomSoundsDialog } from './components/CustomSoundsDialog';
import { SaveLoadManager } from './components/SaveLoadManager';
import { TrackGrid } from './components/TrackGrid';
import { MixerProvider, useMixer } from './state/MixerContext';
import { retroTheme } from './theme';

const AppShell = (): React.ReactElement => {
  const { snapshot, tracks, actions } = useMixer();
  const [customSoundsOpen, setCustomSoundsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);

  // After a "Save new", apply deferred actions on the newly created preset
  // once the track list has been updated (React batching means the preset
  // isn't in `tracks` until the next render).
  const pendingActionsRef = useRef<{
    presetId: string;
    enablePreset: boolean;
    disableSourceId: string | null;
    playPreset: boolean;
  } | null>(null);
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

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

  return (
    <Container
      maxWidth={false}
      sx={{ py: 2.5, height: '100vh', overflow: 'hidden' }}
    >
      <Stack spacing={2.2} sx={{ height: '100%' }}>
        <GlobalControls
          isPlaying={snapshot.transportPlaying}
          onToggleTransport={() => void actions.toggleTransport()}
          onSave={() => setSaveOpen(true)}
          onLoad={() => setLoadOpen(true)}
          onOpenCustomSounds={() => setCustomSoundsOpen(true)}
        />

        <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
          <TrackGrid
            tracks={tracks}
            trackStates={snapshot.trackStates}
            onToggle={(trackId, enabled) =>
              void actions.toggleTrack(trackId, enabled)
            }
            onPlay={(trackId) => void actions.playTrackOnce(trackId)}
            onToggleFavorite={(trackId) => actions.toggleFavorite(trackId)}
            onVolumeChange={(trackId, volume) =>
              actions.setTrackVolume(trackId, volume)
            }
            onSpeedChange={(trackId, speed) =>
              actions.setTrackSpeed(trackId, speed)
            }
            onEqChange={(trackId, eqLow, eqMid, eqHigh) =>
              actions.setTrackEq(trackId, eqLow, eqMid, eqHigh)
            }
            onEffectsChange={(trackId, reverbSend, delaySend) =>
              actions.setTrackEffects(trackId, reverbSend, delaySend)
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
              // Was the edited track enabled (in mix)?
              const wasEnabled =
                snapshot.trackStates[editedTrackId]?.enabled ?? false;
              // 1. Create the new preset
              const newPresetId = actions.saveTrackPreset(
                presetSourceTrackId,
                name,
                category,
                settings,
              );
              // 2. Revert the edited track to its pre-edit state
              actions.restoreTrackSettings(editedTrackId, originalSettings);
              // 3. Stop preview on edited track if it was playing
              if (wasPreviewPlaying) {
                void actions.playTrackOnce(editedTrackId); // toggle off
              }
              // 4. Defer: transfer checkbox + playback to new preset
              pendingActionsRef.current = {
                presetId: newPresetId,
                enablePreset: wasEnabled,
                disableSourceId: wasEnabled ? editedTrackId : null,
                playPreset: wasPreviewPlaying,
              };
            }}
            onSaveOver={(presetId, name, category, settings) =>
              actions.saveTrackPreset(
                presetId,
                name,
                category,
                settings,
                presetId,
              )
            }
            onRestoreChanges={(trackId, settings) =>
              actions.restoreTrackSettings(trackId, settings)
            }
            onSaveToTrack={(trackId, settings) =>
              actions.saveTrackOverride(trackId, settings)
            }
          />
        </Box>

        <GlobalTempoPanel
          globalTempo={snapshot.globalTempo}
          onChange={(tempo) => actions.setGlobalTempo(tempo)}
        />
      </Stack>

      <CustomSoundsDialog
        open={customSoundsOpen}
        sounds={snapshot.customSounds}
        onClose={() => setCustomSoundsOpen(false)}
        onUpload={(file) => void actions.addCustomSound(file)}
        onDelete={(soundId) => void actions.deleteCustomSound(soundId)}
      />

      <SaveLoadManager
        saveOpen={saveOpen}
        loadOpen={loadOpen}
        mixes={snapshot.savedMixes}
        onClose={() => {
          setSaveOpen(false);
          setLoadOpen(false);
        }}
        onSave={(name) => actions.saveMix(name)}
        onLoad={(mixId) => void actions.loadMix(mixId)}
        onDelete={(mixId) => actions.deleteMix(mixId)}
      />
    </Container>
  );
};

export const App = (): React.ReactElement => (
  <ThemeProvider theme={retroTheme}>
    <CssBaseline />
    <MixerProvider>
      <AppShell />
    </MixerProvider>
  </ThemeProvider>
);
