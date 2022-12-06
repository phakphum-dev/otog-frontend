import { ReactNode, createContext, useContext, useRef, useState } from 'react'

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'

import { Button } from '@src/ui/Button'

export interface ConfirmProviderProps {
  onConfirm: (props: ConfirmModalProps) => void
}

const ConfirmContext = createContext({} as ConfirmProviderProps)

interface ConfirmModalProps {
  cancleText: string
  submitText: string
  title: string
  subtitle: string
  onSubmit: () => void | Promise<void>
}

export const ConfirmModalProvider = ({
  children,
}: {
  children?: ReactNode
}) => {
  const [
    { cancleText, submitText, title, subtitle = '', onSubmit },
    setProps,
  ] = useState<ConfirmModalProps>({} as ConfirmModalProps)
  const { isOpen, onClose, onOpen } = useDisclosure()
  const cancelRef = useRef(null)

  const onClick = async () => {
    await onSubmit()
    onClose()
  }

  const value = {
    onConfirm: (props: ConfirmModalProps) => {
      setProps(props)
      onOpen()
    },
  }

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>{title}</AlertDialogHeader>

            <AlertDialogBody>{subtitle}</AlertDialogBody>

            <AlertDialogFooter>
              <div className="flex gap-2">
                <Button ref={cancelRef} onClick={onClose}>
                  {cancleText}
                </Button>
                <Button colorScheme="red" onClick={onClick}>
                  {submitText}
                </Button>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirmModal() {
  const { onConfirm: confirm } = useContext(ConfirmContext)
  return confirm
}
