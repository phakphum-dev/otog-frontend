/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin')

const colors = {
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
  reject: {
    50: '#ffebeb',
    900: '#2c1a1f',
  },
  accept: {
    50: '#ebffeb',
    900: '#1a2c27',
  },
}

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors,
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
    require('@tailwindcss/line-clamp'),
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
            return `.${e(`active${separator}${className}`)}.active`
          })
        },
      ])
    }),
  ],
}
