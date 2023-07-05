import clsx from 'clsx'
import { ComponentProps, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type TitleProps = {
  icon?: ReactNode
  lineClamp?: boolean
  children: ReactNode | string
} & ComponentProps<'div'>

export const Title = ({
  icon,
  lineClamp = false,
  children,
  ...rest
}: TitleProps) => {
  return (
    <div className="flex items-center font-heading text-2xl font-bold md:text-3xl">
      <div className="text-gray-600 dark:text-gray-400">{icon}</div>
      <h1 className={clsx('ml-2', lineClamp && 'line-clamp-1')} {...rest}>
        {children}
      </h1>
    </div>
  )
}

export function TitleLayout({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={twMerge('mb-4 mt-8 flex items-end justify-between', className)}
    >
      {children}
    </div>
  )
}
