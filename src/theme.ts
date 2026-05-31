import { createTheme } from '@mui/material/styles';

export const retroTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#090812',
      paper: '#120f1f',
    },
    primary: {
      main: '#ff4fd8',
    },
    secondary: {
      main: '#40d9ff',
    },
    success: {
      main: '#6cff9f',
    },
    warning: {
      main: '#ff8f4f',
    },
    text: {
      primary: '#f8f4ff',
      secondary: '#b7a8db',
    },
  },
  typography: {
    fontFamily: ['Share Tech Mono', 'monospace'].join(','),
    h1: {
      fontFamily: ['Orbitron', 'sans-serif'].join(','),
      fontWeight: 800,
      letterSpacing: '0.08em',
    },
    h2: {
      fontFamily: ['Orbitron', 'sans-serif'].join(','),
      fontWeight: 700,
      letterSpacing: '0.06em',
    },
    button: {
      fontFamily: ['Orbitron', 'sans-serif'].join(','),
      letterSpacing: '0.08em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#090812',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01)), linear-gradient(135deg, rgba(255,79,216,0.06), rgba(64,217,255,0.04))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.06), 0 20px 60px rgba(0, 0, 0, 0.42), 0 0 32px rgba(64, 217, 255, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'uppercase',
          boxShadow: '0 0 16px rgba(255,79,216,0.18)',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            boxShadow: '0 0 0 6px rgba(255,79,216,0.12), 0 0 18px rgba(64,217,255,0.32)',
          },
          '& .MuiSlider-track': {
            border: 'none',
          },
        },
      },
    },
  },
});