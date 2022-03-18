import { Descendant } from 'slate'

import { AnnouncementEditor } from './AnnouncementEditor'

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

interface Announcement {
  id: number
  value: Descendant[]
}

interface AnnouncementModalProps {
  announcements: Announcement[]
  isOpen: boolean
  onClose: () => void
  setAnnouncements: (value: Announcement[]) => void
}
export const AnnouncementModal = (props: AnnouncementModalProps) => {
  const { isOpen, onClose, announcements, setAnnouncements } = props
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ประกาศ</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AnnouncementEditor
            value={announcements[0].value}
            onChange={(value) => {
              setAnnouncements([
                { ...announcements[0], value },
                ...announcements.slice(1),
              ])
            }}
          />
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
