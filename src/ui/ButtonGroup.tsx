import clsx from 'clsx'
import { PropsWithChildren, forwardRef } from 'react'

export type ButtonGroupProps = PropsWithChildren<{
  isAttached: boolean
}>

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (props, ref) => {
    const { isAttached, children } = props
    return (
      <div
        className={clsx(
          'inline-flex',
          isAttached &&
            '[&>:not(:last-child)]:-mr-px [&>:not(:last-child)]:rounded-r-none [&>:not(:first-child)]:rounded-l-none'
        )}
        ref={ref}
      >
        {children}
      </div>
    )
  }
)
