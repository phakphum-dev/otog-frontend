import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { useColorMode } from '@chakra-ui/react'

import { IconButton, IconButtonProps } from '@src/ui/IconButton'

export function ToggleColorModeButton(props: Omit<IconButtonProps, 'icon'>) {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <IconButton
      rounded
      aria-label="Toggle color mode"
      onClick={toggleColorMode}
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      {...props}
    />
  )
}
