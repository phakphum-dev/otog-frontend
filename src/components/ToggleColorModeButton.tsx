import { forwardRef } from 'react'

import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { useColorMode } from '@chakra-ui/react'

import { IconButton, IconButtonProps } from '@src/ui/IconButton'

export const ToggleColorModeButton = forwardRef<
  HTMLButtonElement,
  Omit<IconButtonProps, 'icon'>
>((props, ref) => {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <IconButton
      rounded="full"
      aria-label="Toggle color mode"
      onClick={toggleColorMode}
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      {...props}
      ref={ref}
    />
  )
})
