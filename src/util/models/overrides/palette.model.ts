import { Palette } from '@mui/material';
import { TypeTheme } from '../../../enums/type.enum';

export const PaletteData = (mode: TypeTheme) =>
  ({
    mode,
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    divider: mode === TypeTheme.Light ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
    background: {
      default: mode === TypeTheme.Light ? '#fafafa' : '#222222',
      paper: mode === TypeTheme.Light ? '#ffffff' : '#333333',
    },
  } as unknown as Palette);
