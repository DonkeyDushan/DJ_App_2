import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  Stack,
  Tab,
  Tabs,
  ThemeProvider,
} from '@mui/material';

import { GlobalControls } from './components/GlobalControls';
import { GlobalTempoPanel } from './components/GlobalTempoPanel';
import { CustomSoundsDialog } from './components/CustomSoundsDialog';
import { SaveLoadManager } from './components/SaveLoadManager';
import { TrackGrid } from './components/TrackGrid';
import { SetTab } from './components/set/SetTab';
import { MixerProvider, useMixer } from './state/MixerContext';
import { SessionProvider } from './state/SessionContext';
import { retroTheme } from './theme';
import { STRINGS } from './strings';

const MixerTab = (): React.ReactElement => {
  const { snapshot, tracks, actions } = useMixer();
  const [customSoundsOpen, setCustomSoundsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);

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
    <>
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
              const wasEnabled =
                snapshot.trackStates[editedTrackId]?.enabled ?? false;
              const newPresetId = actions.saveTrackPreset(
                presetSourceTrackId,
                name,
                category,
                settings,
              );
              actions.restoreTrackSettings(editedTrackId, originalSettings);
              if (wasPreviewPlaying) {
                void actions.playTrackOnce(editedTrackId);
              }
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
    </>
  );
};

const AppShell = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 2,
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, v: number) => setActiveTab(v)}
        sx={{ mb: 1.5, minHeight: 0, flexShrink: 0 }}
        slotProps={{ indicator: { style: { height: 2 } } }}
      >
        <Tab
          label={STRINGS.set.tabMixer}
          sx={{ minHeight: 0, py: 0.75, fontSize: '0.7rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.08em' }}
        />
        <Tab
          label={STRINGS.set.tabSet}
          sx={{ minHeight: 0, py: 0.75, fontSize: '0.7rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.08em' }}
        />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ display: activeTab === 0 ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <MixerTab />
        </Box>
        <Box sx={{ display: activeTab === 1 ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SetTab />
        </Box>
      </Box>
    </Container>
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
