import clsx from 'clsx'
import { ForwardedRef, ReactElement, forwardRef } from 'react'

import { Button, ButtonProps } from './Button'

export type IconButtonProps = ButtonProps & {
  icon: ReactElement
}

export const IconButton = forwardRef(
  (
    { icon, className, ...rest }: IconButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <Button className={clsx('!p-0', className)} {...rest} ref={ref}>
        {icon}
      </Button>
    )
  }
)
