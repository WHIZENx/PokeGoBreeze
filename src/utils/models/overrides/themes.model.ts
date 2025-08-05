import { TypeTheme } from '../../../enums/type.enum';
import { PaletteData } from './palette.model';
import { ThemeOptions } from '@mui/material';

export const getDesignThemes = (mode: TypeTheme) =>
  ({
    breakpoints: {
      values: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        '2xl': 1400,
      },
    },
    components: {
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: mode === TypeTheme.Light ? '#333333' : '#ffffff',
          },
          input: {
            '&::placeholder': {
              color: mode === TypeTheme.Light ? 'rgba(0, 0, 0, 0.42)' : 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedSuccess: {
            color: '#ffffff',
          },
          containedTertiary: {
            color: '#ffffff',
          },
          containedDefault: {
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: mode === TypeTheme.Light ? '#969696' : '#4f4f5c',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: mode === TypeTheme.Light ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: mode === TypeTheme.Light ? '#3f51b5' : '#7986cb',
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === TypeTheme.Light ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            color: mode === TypeTheme.Light ? '#333333' : '#ffffff',
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            color: mode === TypeTheme.Light ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
          },
          label: {
            color: mode === TypeTheme.Light ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
            '&.Mui-disabled': {
              color: mode === TypeTheme.Light ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      },
    },
    palette: PaletteData(mode),
    shape: {
      borderRadius: 4,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
    },
    spacing: 8,
  } as unknown as ThemeOptions);
