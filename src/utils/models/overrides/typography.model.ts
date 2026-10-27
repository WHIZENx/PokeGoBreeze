import type { ThemeOptions, TypographyStyle } from '@mui/material/styles';

export const DESIGN_SYSTEM_FONT_FAMILY = 'var(--font-family-sans)';

type FontWeightToken = 'light' | 'regular' | 'medium' | 'bold';

const variant = (name: string, fontWeight: FontWeightToken, textTransform?: 'uppercase'): TypographyStyle => ({
  fontFamily: DESIGN_SYSTEM_FONT_FAMILY,
  fontWeight: `var(--font-weight-${fontWeight})`,
  fontSize: `var(--typography-${name}-font-size)`,
  lineHeight: `var(--typography-${name}-line-height)`,
  letterSpacing: `var(--typography-${name}-letter-spacing)`,
  ...(textTransform ? { textTransform } : {}),
});

export const DesignSystemTypography: ThemeOptions['typography'] = {
  fontFamily: DESIGN_SYSTEM_FONT_FAMILY,
  fontSize: 14,
  fontWeightLight: 'var(--font-weight-light)',
  fontWeightRegular: 'var(--font-weight-regular)',
  fontWeightMedium: 'var(--font-weight-medium)',
  fontWeightBold: 'var(--font-weight-bold)',
  h1: variant('h1', 'medium'),
  h2: variant('h2', 'medium'),
  h3: variant('h3', 'medium'),
  h4: variant('h4', 'medium'),
  h5: variant('h5', 'medium'),
  h6: variant('h6', 'medium'),
  subtitle1: variant('subtitle1', 'regular'),
  subtitle2: variant('subtitle2', 'medium'),
  body1: variant('body1', 'regular'),
  body2: variant('body2', 'regular'),
  button: variant('button', 'medium', 'uppercase'),
  caption: variant('caption', 'regular'),
  overline: variant('overline', 'regular', 'uppercase'),
};
