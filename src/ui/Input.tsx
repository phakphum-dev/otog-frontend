import clsx from 'clsx'
import { VariantProps, cva } from 'cva'
import { ComponentProps, forwardRef } from 'react'

const inputStyles = cva(
  'block w-full bg-inherit border text-md border-slate-300 dark:border-alpha-white-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:dark:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none',
  {
    variants: {
      variant: {
        lg: 'text-lg px-4 h-12',
        md: 'text-md px-4 h-10',
        sm: 'text-sm px-3 h-8',
        xs: 'text-xs px-2 h-6',
      },
      rounded: {
        md: 'rounded-md',
        '2xl': 'rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'md',
      rounded: 'md',
    },
  }
)

export type InputProps = ComponentProps<'input'> &
  VariantProps<typeof inputStyles>

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { variant, rounded, className, ...rest } = props
  return (
    <input
      className={inputStyles({ variant, rounded, className })}
      ref={ref}
      {...rest}
    />
  )
})

export type TextareaProps = ComponentProps<'textarea'> &
  VariantProps<typeof inputStyles>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    const { variant, rounded, className, ...rest } = props
    return (
      <textarea
        className={inputStyles({
          variant,
          rounded,
          className: clsx(className, 'resize-none text-sm px-3 py-2'),
        })}
        ref={ref}
        {...rest}
      />
    )
  }
)

export type SelectProps = ComponentProps<'select'> &
  VariantProps<typeof inputStyles>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    const { variant, rounded, className, ...rest } = props
    return (
      <div className={clsx('relative', className)}>
        <select
          className={inputStyles({
            variant,
            rounded,
            className: clsx(
              className,
              'appearance-none [&>option]:bg-white dark:[&>option]:bg-gray-700'
            ),
          })}
          ref={ref}
          {...rest}
        />
        <div className="absolute text-xl top-1/2 right-2 -translate-y-1/2 pointer-events-none">
          <DefaultIcon />
        </div>
      </div>
    )
  }
)

export const DefaultIcon = (props: ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    focusable={false}
    className="w-[1em] h-[1em]"
    {...props}
  >
    <path
      fill="currentColor"
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
    />
  </svg>
)

export const FormLabel = ({ className, ...props }: ComponentProps<'label'>) => (
  <label
    className={clsx('block text-md font-medium mb-2 mr-3', className)}
    {...props}
  />
)

export const FormHelperText = ({
  className,
  ...props
}: ComponentProps<'div'>) => (
  <div
    className={clsx(
      'block text-sm mt-2 text-gray-600 dark:text-alpha-white-600',
      className
    )}
    {...props}
  />
)
