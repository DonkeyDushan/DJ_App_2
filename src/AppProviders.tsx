import { CssBaseline, ThemeProvider } from '@mui/material';

import { MixerProvider } from './app/features/Mixer';
import { SetProvider } from './app/features/Set';
import { retroTheme } from './app/theme/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps): React.ReactElement => (
  <ThemeProvider theme={retroTheme}>
    <CssBaseline />
    <MixerProvider>
      <SetProvider>
        {children}
      </SetProvider>
    </MixerProvider>
  </ThemeProvider>
);
