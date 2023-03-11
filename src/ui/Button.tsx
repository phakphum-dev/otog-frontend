import { VariantProps, cva } from 'class-variance-authority'
import clsx from 'clsx'
import {
  ComponentProps,
  PropsWithChildren,
  ReactNode,
  createElement,
  forwardRef,
} from 'react'
import { twMerge } from 'tailwind-merge'

/*
 Chakra Styles
 https://github.com/chakra-ui/chakra-ui/blob/main/packages/components/button/src/button.tsx
 https://github.com/chakra-ui/chakra-ui/blob/main/packages/components/theme/src/components/button.ts
 */

const buttonStyles = cva(
  'inline-flex justify-center items-center select-none transition-colors font-semibold disabled:opacity-40 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        solid: '',
        outline: 'border border-current',
        ghost: 'bg-transparent',
        link: 'hover:underline',
      },
      colorScheme: {
        gray: '',
        otog: '',
        red: '',
        green: '',
        orange: '',
        blue: '',
        'otog-blue': '',
        'otog-green': '',
        'otog-red': '',
        'otog-orange': '',
      },
      size: {
        lg: 'h-12 min-w-12 text-lg',
        md: 'h-10 min-w-10 text-md',
        sm: 'h-8 min-w-8 text-sm',
        xs: 'h-6 min-w-6 text-xs',
        none: '',
      },
      p: {
        lg: 'px-6',
        md: 'px-4',
        sm: 'px-3',
        xs: 'px-2',
        none: '',
      },
      fullWidth: { true: 'w-full' },
      rounded: {
        full: 'rounded-full',
        md: 'rounded-md',
      },
    },
    defaultVariants: {
      variant: 'solid',
      colorScheme: 'gray',
      size: 'md',
      rounded: 'md',
      p: 'md',
    },
    compoundVariants: [
      {
        variant: 'solid',
        colorScheme: 'gray',
        className:
          'bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/16 disabled:hover:bg-gray-100 disabled:hover:dark:bg-white/8 active:bg-gray-300 active:dark:bg-white/24',
      },
      {
        variant: 'solid',
        colorScheme: 'otog',
        className:
          'text-white bg-otog-400 dark:bg-otog-500 hover:bg-otog-500 dark:hover:bg-otog-400 disabled:hover:bg-otog-400 disabled:hover:dark:bg-otog active:bg-otog-700 active:dark:bg-otog-200',
      },
      {
        variant: 'solid',
        colorScheme: 'red',
        className:
          'text-white dark:text-gray-800 bg-red-500 dark:bg-red-200 hover:bg-red-600 dark:hover:bg-red-300 disabled:hover:bg-red-500 disabled:hover:dark:bg-red-200 active:bg-red-700 active:dark:bg-red-400',
      },
      {
        variant: 'solid',
        colorScheme: 'green',
        className:
          'text-white dark:text-gray-800 bg-green-500 dark:bg-green-200 hover:bg-green-600 dark:hover:bg-green-300 disabled:hover:bg-green-500 disabled:hover:dark:bg-green-200 active:bg-green-700 active:dark:bg-green-400',
      },
      {
        variant: 'solid',
        colorScheme: 'blue',
        className:
          'text-white dark:text-gray-800 bg-blue-500 dark:bg-blue-200 hover:bg-blue-600 dark:hover:bg-blue-300 disabled:hover:bg-blue-500 disabled:hover:dark:bg-blue-200 active:bg-blue-700 active:dark:bg-blue-400',
      },
      {
        variant: 'solid',
        colorScheme: 'orange',
        className:
          'text-white dark:text-gray-800 bg-orange-500 dark:bg-orange-200 hover:bg-orange-600 dark:hover:bg-orange-300 disabled:hover:bg-orange-500 disabled:hover:dark:bg-orange-200 active:bg-orange-700 active:dark:bg-orange-400',
      },
      {
        variant: 'solid',
        colorScheme: 'otog-orange',
        className:
          'text-white dark:text-gray-800 bg-otog-orange-500 dark:bg-otog-orange-200 hover:bg-otog-orange-600 dark:hover:bg-otog-orange-300 disabled:hover:bg-otog-orange-500 disabled:hover:dark:bg-otog-orange-200 active:bg-otog-orange-700 active:dark:bg-otog-orange-400',
      },
      {
        variant: 'solid',
        colorScheme: 'otog-red',
        className:
          'text-white dark:text-gray-800 bg-otog-red-500 dark:bg-otog-red-200 hover:bg-otog-red-600 dark:hover:bg-otog-red-300 disabled:hover:bg-otog-red-500 disabled:hover:dark:bg-otog-red-200 active:bg-otog-red-700 active:dark:bg-otog-red-400',
      },
      {
        variant: 'solid',
        colorScheme: 'otog-blue',
        className:
          'text-white dark:text-gray-800 bg-otog-blue-500 dark:bg-otog-blue-200 hover:bg-otog-blue-600 dark:hover:bg-otog-blue-300 disabled:hover:bg-otog-blue-500 disabled:hover:dark:bg-otog-blue-200 active:bg-otog-blue-700 active:dark:bg-otog-blue-400',
      },
      {
        variant: 'solid',
        colorScheme: 'otog-green',
        className:
          'text-white dark:text-gray-800 bg-otog-green-500 dark:bg-otog-green-200 hover:bg-otog-green-600 dark:hover:bg-otog-green-300 disabled:hover:bg-otog-green-500 disabled:hover:dark:bg-otog-green-200 active:bg-otog-green-700 active:dark:bg-otog-green-400',
      },

      {
        variant: 'ghost',
        colorScheme: 'gray',
        className:
          'text-inherit dark:text-white/92 hover:bg-gray-100 hover:dark:bg-white/8 active:bg-gray-200 active:dark:bg-white/16',
      },
      {
        variant: 'ghost',
        colorScheme: 'red',
        className:
          'text-red-600 dark:text-red-200 hover:bg-red-50 hover:dark:bg-red-200/12 active:bg-red-100 active:dark:bg-red-200/24',
      },
      {
        variant: 'ghost',
        colorScheme: 'orange',
        className:
          'text-orange-600 dark:text-orange-200 hover:bg-orange-50 hover:dark:bg-orange-200/12 active:bg-orange-100 active:dark:bg-orange-200/24',
      },

      {
        variant: 'outline',
        colorScheme: 'gray',
        className:
          'text-inherit border-gray-200 dark:text-white/92 dark:border-white/16 hover:bg-gray-100 hover:dark:bg-white/8 active:bg-gray-200 active:dark:bg-white/16',
      },
      {
        variant: 'outline',
        colorScheme: 'red',
        className:
          'text-red-600 dark:text-red-200 hover:bg-red-50 hover:dark:bg-red-200/12 active:bg-red-100 active:dark:bg-red-200/24',
      },
      {
        variant: 'outline',
        colorScheme: 'orange',
        className:
          'text-orange-600 dark:text-orange-200 hover:bg-orange-50 hover:dark:bg-orange-200/12 active:bg-orange-100 active:dark:bg-orange-200/24',
      },
    ],
  }
)

export type ButtonProps = PropsWithChildren<
  VariantProps<typeof buttonStyles> &
    ComponentProps<'button'> & {
      as?: 'a' | 'button'
      leftIcon?: ReactNode
      rightIcon?: ReactNode
      fullWidth?: boolean
      isActive?: boolean
    }
>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      as = 'button',
      className,
      children,
      variant,
      colorScheme,
      size,
      leftIcon,
      rightIcon,
      rounded,
      p,
      isActive = false,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    return createElement(
      as,
      {
        className: twMerge(
          buttonStyles({
            variant,
            colorScheme,
            size: variant === 'link' ? 'none' : size,
            p: p ?? (variant === 'link' ? 'none' : size),
            fullWidth,
            rounded,
          }),
          className
        ),
        'data-active': isActive,
        type: 'button',
        ref,
        ...props,
      },
      <>
        {leftIcon && <ButtonIcon className="mr-2">{leftIcon}</ButtonIcon>}
        {children}
        {rightIcon && <ButtonIcon className="ml-2">{rightIcon}</ButtonIcon>}
      </>
    )
  }
)

const ButtonIcon = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <span className={clsx('inline-flex shrink-0 self-center', className)}>
      {children}
    </span>
  )
}
