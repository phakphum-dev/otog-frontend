import { useAnnouncements } from '../queries'
import { AnnouncementEdit } from './AnnouncementEditor'

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
  const { data: announcements } = useAnnouncements()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ประกาศ</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {announcements?.map((announcement) => (
            <AnnouncementEdit
              announcement={announcement}
              key={announcement.id}
            />
          ))}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
