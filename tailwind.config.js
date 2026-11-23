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
      fontFamily: {
        sans: ['var(--font-family-sans)'],
      },
      fontWeight: {
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-regular)',
        medium: 'var(--font-weight-medium)',
        bold: 'var(--font-weight-bold)',
      },
      zIndex: {
        ...defaultTheme.zIndex,
        1: 1,
        2: 2,
        4: 4,
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
        body1: [
          'var(--typography-body1-font-size)',
          {
            lineHeight: 'var(--typography-body1-line-height)',
            letterSpacing: 'var(--typography-body1-letter-spacing)',
          },
        ],
        body2: [
          'var(--typography-body2-font-size)',
          {
            lineHeight: 'var(--typography-body2-line-height)',
            letterSpacing: 'var(--typography-body2-letter-spacing)',
          },
        ],
        caption: [
          'var(--typography-caption-font-size)',
          {
            lineHeight: 'var(--typography-caption-line-height)',
            letterSpacing: 'var(--typography-caption-letter-spacing)',
          },
        ],
        micro: [
          'var(--typography-micro-font-size)',
          {
            lineHeight: 'var(--typography-micro-line-height)',
            letterSpacing: 'var(--typography-micro-letter-spacing)',
          },
        ],
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
        divider: 'var(--divider)',
        foreground: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          caption: 'var(--text-caption)',
        },
        surface: {
          paper: 'var(--background-paper)',
          selected: 'var(--background-selected)',
        },
        default: 'var(--default)',
        revert: 'var(--revert)',
        link: 'var(--link-color)',
        error: 'var(--text-error)',
        success: 'var(--text-success)',
        'charge-normal': 'var(--text-charge-normal)',
        'charge-nice': 'var(--text-charge-nice)',
        'charge-great': 'var(--text-charge-great)',
        'charge-excellent': 'var(--text-charge-excellent)',
        spinner: {
          default: 'var(--loading-spinner)',
          overlay: 'var(--loading-spinner-bg)',
        },
        table: {
          primary: 'var(--table-primary)',
          info: 'var(--table-info)',
          head: 'var(--table-head)',
          strip: 'var(--background-table-strip)',
          hover: 'var(--background-table-hover)',
          custom: 'var(--custom-table-background)',
        },
        custom: {
          default: 'var(--custom-default)',
        },
      },
      borderRadius: {
        ...defaultTheme.borderRadius,
        DEFAULT: 'var(--border-radius)',
        control: '5px',
        panel: '10px',
      },
      spacing: {
        ...defaultTheme.spacing,
        unit: 'var(--spacing-unit)',
        0.75: '3px',
        1.25: '5px',
        3.75: '15px',
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
        'pokemon-profile': '217px',
        'pokemon-sprite-inner': '205px',
        'form-preview': '200px',
        'selection-panel': '300px',
        'selection-tile': '62px',
        'almost-full': '99%',
        'evolution-card-viewport': 'calc(100vw - 3rem)',
        sidebar: '250px',
        'battle-icon': '35px',
        'move-select': 'calc(100% - 50px)',
      },
      minWidth: {
        form: '350px',
        content: '320px',
        half: '50%',
        'data-table': '250px',
      },
      maxWidth: {
        stats: '500px',
        compact: '300px',
        'evolution-card': '22rem',
        'error-artwork': '900px',
      },
      height: {
        'battle-icon': '35px',
        'pokemon-profile': '217px',
        'pokemon-sprite-inner': '205px',
        'form-preview': '200px',
        'form-content': '190px',
        'evolution-node': '130px',
        'selection-tile': '62px',
        'compact-label': '18px',
        'iv-bar': '13px',
        'results-panel': '600px',
      },
      minHeight: {
        'selection-button': '142px',
        panel: '150px',
      },
      maxHeight: {
        dialog: '60vh',
        overlay: '70vh',
        dropdown: '300px',
        half: '50%',
      },
      inset: {
        'near-center': '49%',
      },
      screens: {
        ...defaultTheme.screens,
        // Compact phone layouts that need more room than the narrowest viewport.
        xs: '420px',
        sm: '576px',
        // MUI-compatible small boundary used by shared navigation content.
        sm1: '600px',
        md: '768px',
        // MUI-compatible medium boundary used by the responsive application bar.
        md1: '900px',
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
