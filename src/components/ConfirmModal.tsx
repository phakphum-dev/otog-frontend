import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  HStack,
  useDisclosure,
} from '@chakra-ui/react'
import {
  createContext,
  PropsWithChildren,
  ProviderProps,
  useContext,
  useRef,
  useState,
} from 'react'

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

export const ConfirmModalProvider = ({ children }: PropsWithChildren<{}>) => {
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
              <HStack>
                <Button ref={cancelRef} onClick={onClose}>
                  {cancleText}
                </Button>
                <Button colorScheme="red" onClick={onClick}>
                  {submitText}
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirmModal() {
  return useContext(ConfirmContext)
}
