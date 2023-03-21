import { PaletteMode } from '@mui/material';

const constant = {
  text: '#000000',
};

export const getDesignThemes = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // palette values for light mode
          constant,
          invert: {
            text: '#000000',
          },
          background: {
            btnType: '#ffffff',
            tablePrimary: '#ffffff',
          },
          customText: {
            caption: '#808080',
          },
        }
      : {
          // palette values for dark mode
          constant,
          invert: {
            text: '#ffffff',
          },
          background: {
            default: '#222222',
            btnType: '#555555',
            input: '#666666',
            tablePrimary: '#d6d6d6',
          },
          customText: {
            caption: '#ebebeb',
          },
        }),
  },
});
