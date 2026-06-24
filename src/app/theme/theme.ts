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
    green: NeonPaletteColor;
    yellow: NeonPaletteColor;
    orange: NeonPaletteColor;
    red: NeonPaletteColor;
    pink: NeonPaletteColor;
    purple: NeonPaletteColor;
  }

  interface PaletteOptions {
    blue: NeonPaletteColor;
    teal: NeonPaletteColor;
    green: NeonPaletteColor;
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
      paper: '#000000',
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
    green: {
      main: '#7abe6e',
      light: '#d0ffc1',
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
          // Disable MUI's dark-mode elevation overlay so raised surfaces
          // (dialogs, popovers) keep the pure black `background.paper` instead
          // of being lightened to a grey (#2e2b39).
          backgroundImage: 'none',
          border: '1px solid #fff',
          borderRadius: '0',
          boxShadow:
            '0 0 0 1px rgba(255, 79, 216, 0.06), 0 20px 60px rgba(0, 0, 0, 0.42), 0 0 32px rgba(64, 217, 255, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          textTransform: 'uppercase',
          boxShadow: 'none',
          fontWeight: 500,
          fontFamily: 'Orbitron, monospace',
          fontSize: '1rem',
          '&.MuiButton-contained': {
            fontWeight: 500,
            color: '#fff',
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
            },
          },
          '&.MuiButton-outlined': {
            border: '1px solid',
            color: '#fff',
            borderColor: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.divider,
            },
          },
          '&.MuiButton-colorError': {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.light,
            },
          },
        }),
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: 10,
          '.MuiDialogTitle-root': {
            padding: 0,
            paddingLeft: 10,
            /*   paddingRight: 0, */
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
          '.MuiDialogContent-root': {
            padding: 10,
            minWidth: '420px',
          },
        },
      },
    },
  },
});
