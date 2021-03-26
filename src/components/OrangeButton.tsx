import {
  Button,
  ButtonProps,
  forwardRef,
  IconButton,
  IconButtonProps,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react'
import { ForwardedRef } from 'react'

export function useOrangeButtonStyles() {
  const theme = useTheme()
  return useColorModeValue(
    {
      bg: theme.colors.orange[400],
      color: 'white',
      _hover: {
        bg: theme.colors.orange[500],
        _disabled: {
          bg: theme.colors.otog,
        },
      },
      _active: { bg: theme.colors.orange[700] },
    },
    {
      bg: theme.colors.orange[500],
      color: 'white',
      _hover: {
        bg: theme.colors.orange[400],
        _disabled: {
          bg: theme.colors.otog,
        },
      },
      _active: { bg: theme.colors.orange[200] },
    }
  )
}

export const OrangeButton = forwardRef(
  (props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const styleProps = useOrangeButtonStyles()
    return <Button {...styleProps} {...props} ref={ref} />
  }
)

export const OrangeIconButton = forwardRef(
  (props: IconButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const styleProps = useOrangeButtonStyles()
    return <IconButton {...styleProps} {...props} ref={ref} />
  }
)
