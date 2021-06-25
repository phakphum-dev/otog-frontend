import { extendTheme, useColorModeValue } from '@chakra-ui/react'
import { theme } from '.'

export function useGlass() {
  const bg = useColorModeValue('rgba(255,255,255,0.5)', 'rgba(0,0,0,0.6)')
  return { bg }
}

export const glassTheme = extendTheme(
  {
    components: {
      Button: {
        baseStyle: {
          rounded: '2xl',
        },
      },
      Input: {
        sizes: {
          md: {
            field: {
              borderRadius: '2xl',
            },
          },
        },
      },
    },
  },
  theme
)
