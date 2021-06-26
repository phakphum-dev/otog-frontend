import { extendTheme, useColorModeValue } from '@chakra-ui/react'
import { theme } from '.'
import { mode } from '@chakra-ui/theme-tools'

export function useGlass() {
  const bg = useColorModeValue('whiteAlpha.500', 'blackAlpha.600')
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
        defaultProps: {
          variant: 'filled',
        },
        variants: {
          filled: (props) => ({
            field: {
              bg: mode('whiteAlpha.600', 'blackAlpha.400')(props),
              // bg: 'whiteAlpha.600',
              color: mode('gray.700', 'white')(props),
              borderRadius: '2xl',
              _placeholder: {
                color: mode('gray.500', undefined)(props),
              },
              _hover: {
                bg: mode('whiteAlpha.500', 'blackAlpha.500')(props),
              },
              _focus: {
                bg: mode('whiteAlpha.500', 'blackAlpha.500')(props),
              },
            },
          }),
        },
      },
    },
  },
  theme
)
