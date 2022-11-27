/** @type {import('tailwindcss').Config} */

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
}
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: { colors },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
