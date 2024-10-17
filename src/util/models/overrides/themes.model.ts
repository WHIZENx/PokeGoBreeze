import { Palette, PaletteColor, Theme, TypeBackground } from '@mui/material';
import { TypeTheme } from '../../../enums/type.enum';

interface Constants {
  text: string;
}

interface CustomText {
  text: string;
  caption: string;
}

interface PaletteModify extends Palette {
  constant: Constants;
  background: TypeBackgroundModify;
  secondary: PaletteColorModify;
  customText: CustomText;
}

interface TypeBackgroundModify extends TypeBackground {
  btnType: string;
  tablePrimary: string;
  tableDivided: string;
  tableStrip: string;
  tableHover: string;
  input: string;
}

interface PaletteColorModify extends PaletteColor {
  fontSize: string;
}

const constant: Constants = {
  text: '#000000',
};

export interface ThemeModify extends Theme {
  palette: PaletteModify;
}

export const getDesignThemes = (mode: TypeTheme) =>
  ({
    palette: {
      constant,
      mode,
      ...(mode === TypeTheme.LIGHT
        ? {
            // palette values for light mode
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
  } as ThemeModify);
