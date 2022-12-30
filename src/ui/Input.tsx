import { VariantProps, cva } from 'cva'
import { ForwardedRef, InputHTMLAttributes, forwardRef } from 'react'

const inputStyles = cva(
  'block w-full bg-inherit border text-md rounded-md border-slate-300 dark:border-alpha-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:dark:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none',
  {
    variants: {
      variant: {
        lg: 'text-lg px-4 h-12',
        md: 'text-md px-4 h-10',
        sm: 'text-sm px-3 h-8',
        xs: 'text-xs px-2 h-6',
      },
    },
    defaultVariants: {
      variant: 'md',
    },
  }
)

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputStyles>

export const Input = forwardRef(
  (props: InputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const { variant, className, ...rest } = props
    return (
      <input
        className={inputStyles({ variant, className })}
        ref={ref}
        {...rest}
      />
    )
  }
)
