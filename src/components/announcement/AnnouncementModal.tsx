import { AnnouncementEditor } from './AnnouncementEditor'
import { useAnnouncement } from './useAnnouncement'

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
}
export const AnnouncementModal = (props: AnnouncementModalProps) => {
  const { isOpen, onClose } = props
  const { currentAnnouncement } = useAnnouncement()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ประกาศ #{currentAnnouncement.id}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AnnouncementEditor />
        </ModalBody>

        <ModalFooter>
          <Button mr={3} colorScheme="red" variant="ghost" onClick={onClose}>
            ลบ
          </Button>
          <Button colorScheme="green" onClick={onClose}>
            บันทึก
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
