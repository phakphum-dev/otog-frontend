import clsx from 'clsx'
import { ComponentProps, forwardRef } from 'react'
import { VariantProps, tv } from 'tailwind-variants'

const inputStyles = tv({
  base: 'block w-full bg-inherit placeholder-slate-400 focus:outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:shadow-none',
  variants: {
    sz: {
      lg: 'text-lg px-4 h-12',
      md: 'text-md px-4 h-10',
      sm: 'text-sm px-3 h-8',
      xs: 'text-xs px-2 h-6',
    },
    rounded: {
      md: 'rounded-md',
      '2xl': 'rounded-2xl',
    },
    variant: {
      outline:
        'border border-slate-300 dark:border-alpha-white-300 focus:border-sky-500 focus:dark:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:border-slate-200',
      unstyled: ' ',
    },
  },
  defaultVariants: {
    sz: 'md',
    rounded: 'md',
    variant: 'outline',
  },
})

export type InputProps = ComponentProps<'input'> &
  VariantProps<typeof inputStyles>

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { sz, rounded, variant, className, ...rest } = props
  return (
    <input
      className={inputStyles({ sz, rounded, variant, className })}
      ref={ref}
      {...rest}
    />
  )
})

export type TextareaProps = ComponentProps<'textarea'> &
  VariantProps<typeof inputStyles>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    const { sz, rounded, className, ...rest } = props
    return (
      <textarea
        className={inputStyles({
          sz,
          rounded,
          className: clsx('resize-none px-3 py-2 text-sm', className),
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
    const { sz, rounded, className, ...rest } = props
    return (
      <div className={clsx('relative', className)}>
        <select
          className={inputStyles({
            sz,
            rounded,
            className: clsx(
              className,
              'appearance-none [&>option]:bg-white dark:[&>option]:bg-gray-700'
            ),
          })}
          ref={ref}
          {...rest}
        />
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xl">
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
    className="h-[1em] w-[1em]"
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
    className={clsx('text-md mb-2 mr-3 block font-medium', className)}
    {...props}
  />
)

export const FormHelperText = ({
  className,
  ...props
}: ComponentProps<'div'>) => (
  <div
    className={clsx(
      'mt-2 block text-sm text-gray-600 dark:text-alpha-white-600',
      className
    )}
    {...props}
  />
)
