import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import {
  Fragment,
  PropsWithChildren,
  ReactNode,
  createContext,
  useContext,
} from 'react'

import { CloseIcon } from '@chakra-ui/icons'

import { IconButton } from '@src/ui/IconButton'

export type ModalContextValue = {
  isOpen: boolean
  onClose: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  isCentered?: boolean
}
type PropsChildren = { children?: ReactNode }
export type ModalProps = PropsWithChildren<ModalContextValue>
const ModalContext = createContext<ModalContextValue>({} as ModalContextValue)
const useModalContext = () => useContext(ModalContext)
export const Modal = (props: ModalProps) => {
  const { isOpen, onClose, size = 'md', isCentered = false, children } = props
  return (
    <ModalContext.Provider value={{ isOpen, onClose, size, isCentered }}>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={onClose}>
          {children}
        </Dialog>
      </Transition>
    </ModalContext.Provider>
  )
}
export const ModalContent = ({ children }: PropsChildren) => {
  const { size, isCentered } = useModalContext()
  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div
        className={clsx(
          'flex min-h-full justify-center text-center',
          isCentered ? 'items-center' : 'items-start'
        )}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel
            className={clsx(
              'relative my-16 flex flex-col transform overflow-hidden rounded-md bg-white dark:bg-gray-700 text-left align-middle shadow-xl transition-all',
              size === 'xs' && 'w-modal-xs',
              size === 'sm' && 'w-modal-sm',
              size === 'md' && 'w-modal-md',
              size === 'lg' && 'w-modal-lg',
              size === 'xl' && 'w-modal-xl',
              size === '2xl' && 'w-modal-2xl',
              size === '3xl' && 'w-modal-3xl'
            )}
          >
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  )
}
export const ModalOverlay = () => {
  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" />
    </Transition.Child>
  )
}
export const ModalBody = ({ children }: PropsChildren) => {
  return <div className="px-6 py-2">{children}</div>
}
export const ModalHeader = ({ children }: PropsChildren) => {
  return (
    <Dialog.Title as="h3" className="text-xl font-medium leading-6 px-6 py-4">
      {children}
    </Dialog.Title>
  )
}
export const ModalFooter = ({ children }: PropsChildren) => {
  return <div className="px-6 py-4 flex justify-end">{children}</div>
}
export const ModalCloseButton = () => {
  const { onClose } = useModalContext()
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
