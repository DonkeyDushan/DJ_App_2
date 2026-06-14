import { CssBaseline, ThemeProvider } from '@mui/material';

import { MixerProvider } from './app/features/Mixer';
import { SessionProvider } from './app/features/Session';
import { retroTheme } from './app/theme/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps): React.ReactElement => (
  <ThemeProvider theme={retroTheme}>
    <CssBaseline />
    <MixerProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </MixerProvider>
  </ThemeProvider>
);
