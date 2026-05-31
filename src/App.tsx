import { useState } from 'react';
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
import { TrackList } from './components/TrackList';
import { MixerProvider, useMixer } from './state/MixerContext';
import { retroTheme } from './theme';

function AppShell(): React.ReactElement {
  const { snapshot, tracks, actions } = useMixer();
  const [customSoundsOpen, setCustomSoundsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);

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
          onClearAll={() => void actions.clearAll()}
        />

        <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
          <TrackList
            tracks={tracks}
            trackStates={snapshot.trackStates}
            onToggle={(trackId, enabled) =>
              void actions.toggleTrack(trackId, enabled)
            }
            onPlay={(trackId) => void actions.playTrackOnce(trackId)}
            onVolumeChange={(trackId, volume) =>
              actions.setTrackVolume(trackId, volume)
            }
            onSpeedChange={(trackId, speed) =>
              actions.setTrackSpeed(trackId, speed)
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
}

export function App(): React.ReactElement {
  return (
    <ThemeProvider theme={retroTheme}>
      <CssBaseline />
      <MixerProvider>
        <AppShell />
      </MixerProvider>
    </ThemeProvider>
  );
}
