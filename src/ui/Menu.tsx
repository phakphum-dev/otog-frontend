import { Menu as MenuHeadless, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { Fragment, ReactNode } from 'react'
import { Button, ButtonProps } from './Button'

type PropsChildren = { children?: ReactNode }

export const Menu = (props: PropsChildren) => {
  const { children } = props
  return (
    <MenuHeadless as="div" className="relative inline-block text-left">
      {children}
    </MenuHeadless>
  )
}

export const MenuButton = MenuHeadless.Button

export const MenuList = ({ children }: PropsChildren) => {
  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <MenuHeadless.Items className="absolute right-0 w-56 origin-top-right rounded-md border bg-white py-2 shadow-sm focus:outline-none dark:bg-gray-700">
        {children}
      </MenuHeadless.Items>
    </Transition>
  )
}

export const MenuItem = <Root extends React.ElementType>({
  children,
  className,
  onClick,
  as,
  ...props
}: ButtonProps<Root>) => {
  return (
    <MenuHeadless.Item as={Fragment}>
      {({ active, close }) => (
        <Button
          as={as}
          className={clsx(
            active && 'bg-gray-100 dark:bg-alpha-white-100',
            'inline-flex w-full px-3 py-1.5',
            className
          )}
          onClick={(e: any) => {
            onClick?.(e)
            close()
          }}
          {...props}
        >
          {' '}
          {children}
        </Button>
      )}
    </MenuHeadless.Item>
  )
}
