import clsx from 'clsx'
import { VariantProps, cva } from 'cva'
import { AnchorHTMLAttributes, PropsWithChildren } from 'react'

const linkStyles = cva(
  'cursor-pointer hover:underline focus-visible:underline',
  {
    variants: {
      variant: {
        default: 'text-otog',
        hidden: 'hover:text-otog',
        close:
          'text-gray-300 dark:text-alpha-400 hover:text-otog hover:dark:text-otog',
        head:
          'hover:text-gray-900 hover:dark:text-gray-100 hover:no-underline transition-colors',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type LinkProps = PropsWithChildren<
  VariantProps<typeof linkStyles> &
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      isExternal?: boolean
    }
>
export const Link = ({
  className,
  children,
  href,
  variant,
  isExternal = false,
  ...props
}: LinkProps) => {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      className={clsx(linkStyles({ variant }), className)}
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener' : undefined}
      {...props}
    >
      {children}
    </a>
  )
}
