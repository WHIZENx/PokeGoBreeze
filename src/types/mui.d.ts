import '@mui/material/Button';
import '@mui/material/ButtonGroup';

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
  }
}

declare module '@mui/material/ButtonGroup' {
  interface ButtonGroupPropsColorOverrides extends ButtonPropsColorOverrides {
    tertiary: true;
  }
}
