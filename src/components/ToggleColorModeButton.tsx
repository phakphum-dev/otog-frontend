import { IconButton, IconButtonProps, useColorMode } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

export function ToggleColorModeButton(
  props: Omit<IconButtonProps, 'aria-label'>
) {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <IconButton
      isRound
      aria-label="Toggle color mode"
      onClick={toggleColorMode}
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      {...props}
    />
  )
}
