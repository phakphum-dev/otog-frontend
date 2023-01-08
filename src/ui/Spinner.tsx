import { VariantProps, cva } from 'cva'
import { ForwardedRef, HTMLAttributes, forwardRef } from 'react'

const spinnerStyle = cva(
  'animate-spin inline-block rounded-full border-2 border-b-transparent border-l-transparent border-solid',
  {
    variants: {
      size: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export type SpinnerProps = VariantProps<typeof spinnerStyle> &
  HTMLAttributes<HTMLDivElement>

export const Spinner = forwardRef(
  (
    { className, size, ...props }: SpinnerProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div className={spinnerStyle({ size, className })} {...props} ref={ref} />
    )
  }
)
