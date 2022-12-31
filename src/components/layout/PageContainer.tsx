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
        'w-full mx-auto px-4 flex-1',
        maxSize === 'md' && 'sm:max-w-screen-sm md:max-w-screen-md',
        maxSize === 'lg' &&
          'sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg',
        className
      )}
    >
      {children}
    </div>
  )
}
