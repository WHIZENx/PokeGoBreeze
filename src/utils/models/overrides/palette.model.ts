import { Palette } from '@mui/material';
import { TypeTheme } from '../../../enums/type.enum';

export const PaletteData = (mode: TypeTheme) =>
  ({
    mode,
    tertiary: {
      main: mode === TypeTheme.Light ? '#5a6268' : '#6c757d',
      select: '#5a6268',
      contrastText: '#ffffff',
    },
    default: {
      main: mode === TypeTheme.Light ? '#e1e1e1' : '#3a3a45',
      select: mode === TypeTheme.Light ? '#969696' : '#4f4f5c',
      contrastText: mode === TypeTheme.Light ? '#000000' : '#ffffff',
    },
    divider: mode === TypeTheme.Light ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
    background: {
      default: mode === TypeTheme.Light ? '#fafafa' : '#222222',
      paper: mode === TypeTheme.Light ? '#ffffff' : '#333333',
    },
    openLeague: {
      main: mode === TypeTheme.Light ? '#e6ffe6' : '#193319',
      select: mode === TypeTheme.Light ? '#e6ffe6' : '#193319',
    },
  }) as unknown as Palette;
