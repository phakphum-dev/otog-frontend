import clsx from 'clsx'
import { ReactNode } from 'react'

type TitleProps = {
  icon: ReactNode
  lineClamp?: boolean
  children: ReactNode | string
}

export const Title = ({ icon, lineClamp = false, children }: TitleProps) => {
  return (
    <h2 className="flex items-center font-bold text-3xl md:text-4xl">
      {icon}
      <div className={clsx('ml-2', lineClamp && 'line-clamp-1')}>
        {children}
      </div>
    </h2>
  )
}

export function TitleLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-8 mb-4 flex justify-between items-end">{children}</div>
  )
}
