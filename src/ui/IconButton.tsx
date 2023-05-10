import { ForwardedRef, ReactElement, forwardRef } from 'react'

import { Button, PolymorphButtonProps } from './Button'
import clsx from 'clsx'

export type IconButtonProps<T extends React.ElementType = 'button'> =
  PolymorphButtonProps<T> & {
    icon: ReactElement
  }

export const IconButton = forwardRef(
  <Root extends React.ElementType>(
    { icon, className, ...rest }: IconButtonProps<Root>,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <Button className={clsx('px-0', className)} {...rest} ref={ref}>
        {icon}
      </Button>
    )
  }
)
