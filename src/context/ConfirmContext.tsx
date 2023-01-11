import { ReactNode, createContext, useContext, useRef, useState } from 'react'

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@src/components/Modal'
import { useDisclosure } from '@src/hooks/useDisclosure'
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
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>

          <ModalBody>{subtitle}</ModalBody>

          <ModalFooter>
            <div className="flex gap-2">
              <Button ref={cancelRef} onClick={onClose}>
                {cancleText}
              </Button>
              <Button colorScheme="red" onClick={onClick} autoFocus>
                {submitText}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirmModal() {
  const { onConfirm: confirm } = useContext(ConfirmContext)
  return confirm
}
