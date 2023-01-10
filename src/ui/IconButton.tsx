import { ReactElement, forwardRef } from 'react'

import { Button, ButtonProps } from './Button'

export type IconButtonProps = ButtonProps & {
  icon: ReactElement
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ...rest }, ref) => {
    return (
      <Button p="none" {...rest} ref={ref}>
        {icon}
      </Button>
    )
  }
)
