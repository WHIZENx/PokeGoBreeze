import { PaletteMode } from '@mui/material';

export const getDesignThemes = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // palette values for light mode
          background: {
            btnType: '#fff',
          },
        }
      : {
          // palette values for dark mode
          background: {
            default: '#222',
            btnType: '#555',
          },
        }),
  },
});
