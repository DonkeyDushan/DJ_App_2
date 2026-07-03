import { CssBaseline, ThemeProvider } from '@mui/material';

import { MixerProvider } from './app/features/Mixer';
import { SetProvider } from './app/features/Set';
import { TutorialProvider } from './app/features/Tutorial';
import { retroTheme } from './app/theme/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps): React.ReactElement => (
  <ThemeProvider theme={retroTheme}>
    <CssBaseline />
    <MixerProvider>
      <SetProvider>
        <TutorialProvider>{children}</TutorialProvider>
      </SetProvider>
    </MixerProvider>
  </ThemeProvider>
);
