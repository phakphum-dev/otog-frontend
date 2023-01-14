import { Dialog, Transition } from '@headlessui/react'
import {
  Fragment,
  PropsWithChildren,
  ReactNode,
  createContext,
  useContext,
} from 'react'

import { CloseIcon } from '@src/icons/CloseIcon'
import { IconButton } from '@src/ui/IconButton'

export type DrawerContextValue = {
  isOpen: boolean
  onClose: () => void
}
type PropsChildren = { children?: ReactNode }
export type DrawerProps = PropsWithChildren<DrawerContextValue>
const DrawerContext = createContext<DrawerContextValue>(
  {} as DrawerContextValue
)
const useDrawerContext = () => useContext(DrawerContext)
export const Drawer = (props: DrawerProps) => {
  const { isOpen, onClose, children } = props
  return (
    <DrawerContext.Provider value={{ isOpen, onClose }}>
      <Transition appear show={isOpen}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          {children}
        </Dialog>
      </Transition>
    </DrawerContext.Provider>
  )
}
export const DrawerContent = ({ children }: PropsChildren) => {
  return (
    <Transition.Child
      as={Fragment}
      enter="transition-transform duration-300"
      enterFrom="translate-x-full"
      enterTo="translate-x-0"
      leave="transition-transform duration-200"
      leaveFrom="translate-x-0"
      leaveTo="translate-x-full"
    >
      <Dialog.Panel className="fixed flex z-50 h-screen overflow-y-auto right-0 top-0 shadow-lg">
        {children}
      </Dialog.Panel>
    </Transition.Child>
  )
}
export const DrawerOverlay = () => {
  return (
    <Transition.Child
      as={Fragment}
      enter="transform duration-700"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
    </Transition.Child>
  )
}
export const DrawerBody = ({ children }: PropsChildren) => {
  return (
    <div className="w-80 bg-white dark:bg-gray-700 px-6 py-2">{children}</div>
  )
}
export const DrawerCloseButton = () => {
  const { onClose } = useDrawerContext()
  return (
    <IconButton
      size="sm"
      variant="ghost"
      icon={<CloseIcon />}
      className="absolute right-3 top-2 !text-xs"
      onClick={onClose}
    />
  )
}
