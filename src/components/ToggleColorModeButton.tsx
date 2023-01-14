import { useTheme } from 'next-themes'
import { forwardRef } from 'react'

import { MoonIcon } from '@src/icons/MoonIcon'
import { SunIcon } from '@src/icons/SunIcon'
import { IconButton, IconButtonProps } from '@src/ui/IconButton'

export const ToggleColorModeButton = forwardRef<
  HTMLButtonElement,
  Omit<IconButtonProps, 'icon'>
>((props, ref) => {
  const { theme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }
  return (
    <IconButton
      rounded="full"
      aria-label="Toggle color mode"
      onClick={toggleColorMode}
      icon={theme === 'light' ? <MoonIcon /> : <SunIcon />}
      {...props}
      ref={ref}
    />
  )
})
