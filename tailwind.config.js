/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

module.exports = {
  prefix: 'tw-',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      zIndex: {
        ...defaultTheme.zIndex,
        2: 2,
        7: 7,
      },
      listStyleType: {
        ...defaultTheme.listStyleType,
        circle: 'circle',
      },
      colors: {
        ...defaultTheme.colors,
        primary: 'var(--primary-main)',
        secondary: 'var(--secondary-main)',
        default: 'var(--default)',
        revert: 'var(--revert)',
        link: 'var(--link-color)',
        spinner: {
          default: 'var(--loading-spinner)',
          overlay: 'var(--loading-spinner-bg)',
        },
        table: {
          primary: 'var(--table-primary)',
          info: 'var(--table-info)',
          head: 'var(--table-head)',
        },
        custom: {
          default: 'var(--custom-default)',
        },
      },
      borderRadius: {
        ...defaultTheme.borderRadius,
        DEFAULT: 'var(--border-radius)',
      },
      spacing: {
        ...defaultTheme.spacing,
        unit: 'var(--spacing-unit)',
      },
      screens: {
        ...defaultTheme.screens,
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        '2xl': '1400px',
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '0.75rem',
      },
      screens: {
        sm: '540px',
        md: '720px',
        lg: '960px',
        xl: '1140px',
        '2xl': '1320px',
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        '@import "src/assets/styles/variables.scss"': {},
      });
    }),
  ],
};
