import clsx from 'clsx'
import { ReactNode } from 'react'

export type PageContainerProps = {
  className?: string
  children: ReactNode
  maxSize?: 'lg' | 'md'
}

export const PageContainer = ({
  className,
  maxSize = 'lg',
  children,
}: PageContainerProps) => {
  return (
    <div
      className={clsx(
        'mx-auto w-full flex-1 px-4',
        maxSize === 'md' && 'max-w-screen-sm md:max-w-screen-md',
        maxSize === 'lg' &&
          'max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg',
        className
      )}
    >
      {children}
    </div>
  )
}
