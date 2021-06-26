import {
  extendTheme,
  ThemeComponents,
  ThemeConfig,
  ThemeOverride,
} from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

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
    900: '#2c1a1f',
  },
  accept: {
    50: '#ebffeb',
    900: '#1a2c27',
  },
  btn_blue: {
    50: '#dbfaff',
    100: '#b1e9fc',
    200: '#86daf6',
    300: '#58caf1',
    400: '#2dbbeb',
    // original
    500: '#17b4e9',
    600: '#027ea4',
    700: '#005a76',
    800: '#00374a',
    900: '#00141d',
  },
  btn_green: {
    50: '#e2fee2',
    100: '#b9f6ba',
    200: '#8eee8e',
    300: '#62e763',
    400: '#38e138',
    // original
    500: '#41e241',
    600: '#149b16',
    700: '#0a6f0e',
    800: '#024305',
    900: '#001800',
  },
  btn_red: {
    50: '#ffe2e2',
    100: '#ffb1b2',
    200: '#ff7f7f',
    300: '#ff4d4d',
    400: '#fe1d1b',
    // original
    500: '#ff4d4d',
    600: '#b30000',
    700: '#810000',
    800: '#4f0000',
    900: '#200000',
  },
  btn_orange: {
    50: '#fff4da',
    100: '#ffe0ae',
    200: '#ffcc7d',
    300: '#ffb74b',
    400: '#ffa31a',
    // original
    500: '#ffad33',
    600: '#b36b00',
    700: '#814c00',
    800: '#4f2d00',
    900: '#1f0d00',
  },
  btn_gray: '#c8c8c8',
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

const components: ThemeComponents = {
  Link: {
    defaultProps: { variant: 'default' },
    variants: {
      default: {
        color: 'otog',
      },
      hidden: {
        _hover: {
          color: 'otog',
          textDecoration: 'underline',
        },
        transitionDuration: '0s',
      },
      close: (props) => ({
        _hover: {
          color: 'otog',
          textDecoration: 'underline',
        },
        transitionDuration: '0s',
        color: mode('gray.300', 'whiteAlpha.400')(props),
      }),
    },
  },
  Button: {
    variants: {
      otog: (props) => ({
        bg: mode('orange.400', 'orange.500')(props),
        color: 'white',
        _hover: {
          bg: mode('orange.500', 'orange.400')(props),
          _disabled: {
            bg: 'otog',
          },
        },
        _active: { bg: mode('orange.700', 'orange.200')(props) },
      }),
    },
  },
}

export const overrides = { colors, sizes, components }
export const theme = extendTheme(overrides)
