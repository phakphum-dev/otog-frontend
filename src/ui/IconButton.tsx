import { ForwardedRef, ReactElement, forwardRef } from 'react'

import { Button, ButtonProps } from './Button'
import clsx from 'clsx'

export type IconButtonProps = ButtonProps & {
  icon: ReactElement
}

export const IconButton = forwardRef(
  (
    { icon, className, ...rest }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <Button className={clsx('px-0', className)} {...rest} ref={ref}>
        {icon}
      </Button>
    )
  }
)
