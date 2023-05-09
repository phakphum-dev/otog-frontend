import { ReactElement, forwardRef } from 'react'

import { Button, ButtonProps } from './Button'
import clsx from 'clsx'

export type IconButtonProps = ButtonProps & {
  icon: ReactElement
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, ...rest }, ref) => {
    return (
      <Button className={clsx('px-0', className)} {...rest} ref={ref}>
        {icon}
      </Button>
    )
  }
)
