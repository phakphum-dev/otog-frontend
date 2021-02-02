import { extendTheme } from '@chakra-ui/react'

const colors = {
  otog: '#ff851b',
  orange: {
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
}

const sizes = {
  container: {
    sm: '640px',
    md: '768px',
    lg: '768px',
    xl: '768px',
    // lg: '1024px',
    // xl: '1280px'
  },
}

export const theme = extendTheme({ colors, sizes })
