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
    <h2 className="flex items-center text-2xl font-bold md:text-3xl">
      {icon}
      <div className={clsx('ml-2', lineClamp && 'line-clamp-1')} {...rest}>
        {children}
      </div>
    </h2>
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
