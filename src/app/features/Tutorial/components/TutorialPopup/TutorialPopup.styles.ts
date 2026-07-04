import type { SxProps, Theme } from '@mui/material';

import { POPUP_WIDTH_PX, TUTORIAL_Z_INDEX } from '../../constants/tutorialLayout';

export const rootSx: SxProps<Theme> = {
  position: 'fixed',
  width: `${POPUP_WIDTH_PX}px`,
  maxWidth: `calc(100vw - 1.5rem)`,
  zIndex: TUTORIAL_Z_INDEX + 1,
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'primary.main',
  boxShadow: '0 0 24px rgba(229, 28, 132, 0.35)',
};

export const tabsSx: SxProps<Theme> = {
  minHeight: 0,
  mb: 0.5,
  borderBottom: '1px solid',
  borderColor: 'divider',
  '& .MuiTab-root': {
    minHeight: 0,
    py: 0.75,
    fontFamily: 'Orbitron, monospace',
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    color: 'text.secondary',
  },
  '& .MuiTab-root.Mui-selected': {
    color: 'primary.main',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: 'primary.main',
  },
};

export const titleSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '1rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  color: 'primary.main',
};

export const bodySx: SxProps<Theme> = {
  color: 'text.primary',
  fontSize: '0.9375rem',
  lineHeight: 1.5,
};

export const footerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  mt: 0.5,
};

export const progressSx: SxProps<Theme> = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.75rem',
  letterSpacing: '0.12em',
  color: 'text.secondary',
  userSelect: 'none',
};

export const navSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

export const hintSx: SxProps<Theme> = {
  fontSize: '0.6875rem',
  letterSpacing: '0.06em',
  color: 'text.secondary',
  opacity: 0.7,
  userSelect: 'none',
};
