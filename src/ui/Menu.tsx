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

export const MenuItem = ({
  children,
  className,
  onClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref,
  ...props
}: ButtonProps) => {
  return (
    <MenuHeadless.Item as={Fragment}>
      {({ close }) => (
        <Button
          variant="ghost"
          className={clsx(
            'inline-flex w-full justify-start rounded-none px-3 py-1.5 font-normal',
            className
          )}
          onClick={(e: any) => {
            onClick?.(e)
            close()
          }}
          {...props}
        >
          {children}
        </Button>
      )}
    </MenuHeadless.Item>
  )
}
