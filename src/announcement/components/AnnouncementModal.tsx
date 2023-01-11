import { AnnouncementEditor } from './AnnouncementEditor'
import { useAnnouncementContext } from './useAnnouncementContext'

import { Button } from '@src/ui/Button'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@src/ui/Modal'

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
}
export const AnnouncementModal = (props: AnnouncementModalProps) => {
  const { isOpen, onClose } = props
  const { currentAnnouncement, onSave, deleteIndex } = useAnnouncementContext()
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
          <Button
            className="mr-3"
            colorScheme="red"
            variant="ghost"
            onClick={deleteIndex}
          >
            ลบ
          </Button>
          <Button colorScheme="green" onClick={onSave}>
            บันทึก
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
