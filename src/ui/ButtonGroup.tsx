import clsx from 'clsx'
import {
  Children,
  ForwardedRef,
  ReactElement,
  cloneElement,
  forwardRef,
} from 'react'

export type ButtonGroupProps = {
  isAttached: boolean
  children: ReactElement | ReactElement[]
}

export const ButtonGroup = forwardRef(
  (props: ButtonGroupProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { isAttached, children } = props
    return (
      <div className="inline-flex" ref={ref}>
        {Children.map(children, (child) => {
          return cloneElement(child, {
            ...child.props,
            className: clsx(
              isAttached &&
                '[&:not(:last-child)]:-mr-px [&:not(:last-child)]:rounded-r-none [&:not(:first-child)]:rounded-l-none',
              child.props.className
            ),
          })
        })}
      </div>
    )
  }
)
