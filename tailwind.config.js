/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

const utilities = {
  '.title-medium': {
    fontSize: '18px',
    lineHeight: '27px',
  },
};

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
      lineHeight: {
        ...defaultTheme.lineHeight,
        1: '1',
        default: '1.5',
        small: '1.2',
      },
      fontSize: {
        ...defaultTheme.fontSize,
        'extra-small': '12px',
        small: '16px',
        medium: '18px',
      },
      colors: {
        ...defaultTheme.colors,
        lightgray: 'lightgray',
        accent: {
          red: 'red',
          blue: 'blue',
          yellow: 'yellow',
          green: 'green',
          crimson: 'crimson',
        },
        archetype: {
          nuke: 'gray',
          'spam-bait': 'pink',
          'high-energy': 'orange',
          debuff: 'lightcoral',
          boost: 'lightgreen',
          'fast-charge': '#f8d030',
          'heavy-damage': 'brown',
          multipurpose: 'lightskyblue',
        },
        combat: {
          block: 'purple',
          matchup: 'lightgreen',
          counter: 'lightcoral',
        },
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
        1.25: '5px',
        7.5: '30px',
        12.5: '50px',
        15: '60px',
        18: '72px',
        20: '80px',
        22.5: '90px',
        25: '100px',
        30: '120px',
        36.5: '146px',
        75: '300px',
      },
      width: {
        sidebar: '250px',
        'battle-icon': '35px',
        'move-select': 'calc(100% - 50px)',
      },
      minWidth: {
        form: '350px',
        content: '320px',
      },
      maxWidth: {
        stats: '500px',
      },
      minHeight: {
        'selection-button': '142px',
      },
      maxHeight: {
        dialog: '60vh',
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
    plugin(function ({ addUtilities }) {
      addUtilities(utilities);
    }),
    plugin(function ({ addBase }) {
      addBase({
        '@import "src/assets/styles/variables.scss"': {},
      });
    }),
  ],
};
