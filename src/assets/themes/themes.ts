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
          text: {
            primary: '#000000',
          },
          background: {
            btnType: '#ffffff',
            tablePrimary: '#ffffff',
            tableDivided: '#0000001f',
            tableStrip: '#fafafa',
            tableHover: '#eeeeee',
          },
          customText: {
            text: '#000000',
            caption: '#808080',
          },
        }
      : {
          // palette values for dark mode
          constant,
          text: {
            primary: '#ffffff',
          },
          background: {
            default: '#222222',
            btnType: '#555555',
            input: '#666666',
            tablePrimary: '#222222',
            tableDivided: '#ffffff1f',
            tableStrip: '#050505',
            tableHover: '#111111',
          },
          customText: {
            text: '#ffffff',
            caption: '#ebebeb',
          },
        }),
  },
});
