const plugin = require('tailwindcss/plugin')

const colors = {
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
  red: {
    50: '#FFF5F5',
    100: '#FED7D7',
    200: '#FEB2B2',
    300: '#FC8181',
    400: '#F56565',
    500: '#E53E3E',
    600: '#C53030',
    700: '#9B2C2C',
    800: '#822727',
    900: '#63171B',
  },
  green: {
    50: '#F0FFF4',
    100: '#C6F6D5',
    200: '#9AE6B4',
    300: '#68D391',
    400: '#48BB78',
    500: '#38A169',
    600: '#2F855A',
    700: '#276749',
    800: '#22543D',
    900: '#1C4532',
  },
  blue: {
    50: '#ebf8ff',
    100: '#bee3f8',
    200: '#90cdf4',
    300: '#63b3ed',
    400: '#4299e1',
    500: '#3182ce',
    600: '#2b6cb0',
    700: '#2c5282',
    800: '#2a4365',
    900: '#1A365D',
  },
  otog: {
    DEFAULT: '#ff851b',
    50: '#ffefdb',
    100: '#ffd5ae',
    200: '#ffbb7e',
    300: '#ff9f4c',
    400: '#ff841a',
    500: '#e66b00',
    600: '#b45300',
    700: '#813a00',
    800: '#4f2300',
    900: '#200900',
    blue: {
      DEFAULT: '#17b4e9',
      50: '#dbfaff',
      100: '#b1e9fc',
      200: '#86daf6',
      300: '#58caf1',
      400: '#2dbbeb',
      500: '#17b4e9',
      600: '#027ea4',
      700: '#005a76',
      800: '#00374a',
      900: '#00141d',
    },
    green: {
      DEFAULT: '#41e241',
      50: '#e2fee2',
      100: '#b9f6ba',
      200: '#8eee8e',
      300: '#62e763',
      400: '#38e138',
      500: '#41e241',
      600: '#149b16',
      700: '#0a6f0e',
      800: '#024305',
      900: '#001800',
    },
    red: {
      DEFAULT: '#ff4d4d',
      50: '#ffe2e2',
      100: '#ffb1b2',
      200: '#ff7f7f',
      300: '#ff4d4d',
      400: '#fe1d1b',
      500: '#ff4d4d',
      600: '#b30000',
      700: '#810000',
      800: '#4f0000',
      900: '#200000',
    },
    orange: {
      DEFAULT: '#ffad33',
      50: '#fff4da',
      100: '#ffe0ae',
      200: '#ffcc7d',
      300: '#ffb74b',
      400: '#ffa31a',
      500: '#ffad33',
      600: '#b36b00',
      700: '#814c00',
      800: '#4f2d00',
      900: '#1f0d00',
    },
    gray: '#c8c8c8',
  },
  // whiteAlpha from https://github.com/chakra-ui/chakra-ui/blob/main/packages/components/theme/src/foundations/colors.ts
  alpha: {
    white: {
      50: 'rgba(255, 255, 255, 0.04)',
      100: 'rgba(255, 255, 255, 0.06)',
      200: 'rgba(255, 255, 255, 0.08)',
      300: 'rgba(255, 255, 255, 0.16)',
      400: 'rgba(255, 255, 255, 0.24)',
      500: 'rgba(255, 255, 255, 0.36)',
      600: 'rgba(255, 255, 255, 0.48)',
      700: 'rgba(255, 255, 255, 0.64)',
      800: 'rgba(255, 255, 255, 0.80)',
      900: 'rgba(255, 255, 255, 0.92)',
    },
    black: {
      50: 'rgba(0, 0, 0, 0.04)',
      100: 'rgba(0, 0, 0, 0.06)',
      200: 'rgba(0, 0, 0, 0.08)',
      300: 'rgba(0, 0, 0, 0.16)',
      400: 'rgba(0, 0, 0, 0.24)',
      500: 'rgba(0, 0, 0, 0.36)',
      600: 'rgba(0, 0, 0, 0.48)',
      700: 'rgba(0, 0, 0, 0.64)',
      800: 'rgba(0, 0, 0, 0.80)',
      900: 'rgba(0, 0, 0, 0.92)',
    },
  },
  reject: {
    50: '#ffebeb',
    900: '#2c1a1f',
  },
  accept: {
    50: '#ebffeb',
    900: '#1a2c27',
  },
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        spin: 'spin 0.45s linear infinite',
      },
      colors,
      width: {
        'modal-xs': '20rem',
        'modal-sm': '24rem',
        'modal-md': '28rem',
        'modal-lg': '32rem',
        'modal-xl': '36rem',
        'modal-2xl': '42rem',
        'modal-3xl': '48rem',
      },
      minWidth: {
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
      },
      opacity: {
        4: '.04',
        6: '.06',
        8: '.08',
        16: '.16',
        24: '.24',
        36: '.36',
        48: '.48',
        64: '.64',
        80: '.80',
        92: '.92',
        12: '.12',
      },
      aspectRatio: {
        '5/4': '5 / 4',
      },
      zIndex: {
        100: '100',
        101: '101',
      },
    },
  },
  plugins: [
    // custom plugin for 'active' class
    plugin(function ({ addVariant, e }) {
      addVariant('active', [
        ({ modifySelectors, separator }) => {
          modifySelectors(({ className }) => {
            return `.${e(`active${separator}${className}`)}:active`
          })
        },
        ({ modifySelectors, separator }) => {
          modifySelectors(({ className }) => {
            return `.${e(`active${separator}${className}`)}[data-active="true"]`
          })
        },
      ])
    }),
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.word-break': {
          'word-break': 'break-word',
        },
      })
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'translate-z': (value) => ({
            '--tw-translate-z': value,
            transform: ` translate3d(var(--tw-translate-x), var(--tw-translate-y), var(--tw-translate-z)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))`,
          }), // this is actual CSS
        },
        { values: theme('translate'), supportsNegativeValues: true }
      )
    }),
  ],
}
