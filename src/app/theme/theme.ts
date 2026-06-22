import { createTheme } from '@mui/material/styles';

/**
 * A named palette color in the retro/neon system, exposing only the two tones
 * the design uses: `main` (full neon saturation) and `light` (a softer tint
 * used for hovers, glows, and secondary accents).
 */
type NeonPaletteColor = {
  main: string;
  light: string;
};

declare module '@mui/material/styles' {
  interface Palette {
    blue: NeonPaletteColor;
    teal: NeonPaletteColor;
    yellow: NeonPaletteColor;
    orange: NeonPaletteColor;
    red: NeonPaletteColor;
    pink: NeonPaletteColor;
    purple: NeonPaletteColor;
  }

  interface PaletteOptions {
    blue: NeonPaletteColor;
    teal: NeonPaletteColor;
    yellow: NeonPaletteColor;
    orange: NeonPaletteColor;
    red: NeonPaletteColor;
    pink: NeonPaletteColor;
    purple: NeonPaletteColor;
  }
}

export const retroTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#090812',
      paper: '#120f1f',
    },
    text: {
      primary: '#fff',
      secondary: '#979EA6',
    },
    divider: '#fff',
    primary: {
      main: '#e51c84',
      light: '#ff82e9',
    },
    secondary: {
      main: '#61c1fb',
      light: '#beffff',
    },
    success: {
      main: '#00ffff',
      dark: '#0000ff',
    },
    warning: {
      main: '#beffff',
    },
    error: {
      main: '#d81f40',
    },
    blue: {
      main: '#6149f5',
      light: '#bea4ff',
    },
    teal: {
      main: '#61c1fb',
      light: '#beffff',
    },
    yellow: {
      main: '#faae40',
      light: '#ffff9b',
    },
    orange: {
      main: '#f1531c',
      light: '#ffae82',
    },
    red: {
      main: '#d81f40',
      light: '#ff839b',
    },
    pink: {
      main: '#e51c84',
      light: '#ff82e9',
    },
    purple: {
      main: '#993cff',
      light: '#ff98ff',
    },
  },
  typography: {
    fontFamily: ['Mozilla Headline', 'monospace'].join(','),
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
          border: '1px solid #fff',
          boxShadow:
            '0 0 0 1px rgba(255, 79, 216, 0.06), 0 20px 60px rgba(0, 0, 0, 0.42), 0 0 32px rgba(64, 217, 255, 0.08)',
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
            boxShadow:
              '0 0 0 6px rgba(255,79,216,0.12), 0 0 18px rgba(64,217,255,0.32)',
          },
          '& .MuiSlider-track': {
            border: 'none',
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        /* arrow: true, */
      },
      styleOverrides: {
        tooltip: {
          backgroundColor: '#000',
          color: '#fff',
          fontSize: '0.875rem',
          borderRadius: 0,
          border: '1px solid #fff',
        },
        arrow: {
          color: '#fff',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          padding: '0.5rem',
          '&:hover': {
            color: theme.palette.teal.light,
            backgroundColor: 'transparent',
          },
          '&.Mui-disabled': { opacity: 0.3 },
        }),
      },
    },
  },
});
