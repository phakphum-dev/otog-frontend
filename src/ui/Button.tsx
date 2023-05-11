import { PolymorphicProps } from '@src/utils/types'
import clsx from 'clsx'
import React, {
  ComponentProps,
  ForwardedRef,
  ReactNode,
  createElement,
  forwardRef,
} from 'react'
import { VariantProps, tv } from 'tailwind-variants'

/*
 Chakra Styles
 https://github.com/chakra-ui/chakra-ui/blob/main/packages/components/button/src/button.tsx
 https://github.com/chakra-ui/chakra-ui/blob/main/packages/components/theme/src/components/button.ts
 */

const buttonStyles = tv({
  base: 'inline-flex justify-center items-center select-none transition-colors font-semibold disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap rounded-md',
  variants: {
    colorScheme: {
      gray: ' ',
      otog: ' ',
      red: ' ',
      green: ' ',
      orange: ' ',
      blue: ' ',
      yellow: ' ',
      'otog-blue': ' ',
      'otog-green': ' ',
      'otog-red': ' ',
      'otog-orange': ' ',
    },
    size: {
      lg: 'h-12 min-w-12 text-lg px-6',
      md: 'h-10 min-w-10 text-md px-4',
      sm: 'h-8 min-w-8 text-sm px-3',
      xs: 'h-6 min-w-6 text-xs px-2',
    },
    variant: {
      solid: ' ',
      outline: 'border border-current',
      ghost: 'bg-transparent',
      link: 'hover:underline px-0',
    },
    fullWidth: { true: 'w-full' },
    rounded: { true: 'rounded-full' },
  },
  defaultVariants: {
    variant: 'solid',
    colorScheme: 'gray',
    size: 'md',
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
      colorScheme: 'yellow',
      className:
        'text-gray-900 dark:text-gray-800 bg-yellow-400 dark:bg-yellow-200 hover:bg-yellow-500 dark:hover:bg-yellow-300 disabled:hover:bg-yellow-700 disabled:hover:dark:bg-yellow-200 active:bg-yellow-600 active:dark:bg-yellow-400',
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
    {
      variant: 'outline',
      colorScheme: 'otog-green',
      className:
        'dark:border-white/16 border-black/8 bg-otog-green-50 text-otog-green-700 hover:bg-otog-green-100 active:bg-otog-green-200 dark:bg-otog-green-800 dark:text-green-50 dark:hover:bg-otog-green-700 dark:active:bg-otog-green-600',
    },
    {
      variant: 'outline',
      colorScheme: 'otog-red',
      className:
        'dark:border-white/16 border-black/8 bg-otog-red-50 text-otog-red-700 hover:bg-otog-red-100 active:bg-otog-red-200 dark:bg-otog-red-800 dark:text-red-50 dark:hover:bg-otog-red-700 dark:active:bg-otog-red-600',
    },
  ],
})

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonStyles> & {
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    fullWidth?: boolean
    isActive?: boolean
  }

export type PolymorphButtonProps<T extends React.ElementType> =
  PolymorphicProps<ButtonProps, T>

export const Button = forwardRef(
  <T extends React.ElementType>(
    {
      as,
      className,
      children,
      variant,
      colorScheme,
      size,
      leftIcon,
      rightIcon,
      rounded,
      isActive = false,
      fullWidth = false,
      ...props
    }: PolymorphButtonProps<T>,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return createElement(
      as ?? 'button',
      {
        className: buttonStyles({
          variant,
          colorScheme,
          size,
          fullWidth,
          rounded,
          className,
        }),
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
) as <T extends React.ElementType>(
  props: PolymorphButtonProps<T>
) => React.ReactElement
// for fix weird forwardRef typing

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
