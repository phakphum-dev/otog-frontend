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
  orangeSwitch: {
    200: '#ff841a',
    500: '#ff841a',
  },
  reject: {
    50: '#ffebeb',
    100: '#fab5b5',
    200: '#f98483',
    300: '#f95451',
    400: '#f92c21',
    500: '#e11d0b',
    600: '#ae1407',
    700: '#7c0d06',
    800: '#4a0503',
    900: '#2c1a1f',
  },
  accept: {
    50: '#ebffeb',
    100: '#b7febb',
    200: '#86fe94',
    300: '#56fe73',
    400: '#2ffe5a',
    500: '#20e554',
    600: '#18b24a',
    700: '#0f7f3b',
    800: '#054c27',
    900: '#1a2c27',
  },
}

const sizes = {
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1024px',
    // xl: '1280px'
  },
}

export const theme = extendTheme({ colors, sizes })
