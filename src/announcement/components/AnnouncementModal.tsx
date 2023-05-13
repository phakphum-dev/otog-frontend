import { Button } from '@src/ui/Button'
import { createAnnouncement, useAnnouncements } from '../queries'
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
import { FaPlus } from 'react-icons/fa'
import { useMutation } from '@src/hooks/useMutation'
import { createEmptyAnnouncement } from './utils'
import produce from 'immer'
import { onErrorToast } from '@src/hooks/useErrorToast'

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
}
export const AnnouncementModal = (props: AnnouncementModalProps) => {
  const { isOpen, onClose } = props
  const { data: announcements, mutate } = useAnnouncements()

  const createAnnouncementMutation = useMutation(createAnnouncement)
  const insert = async () => {
    try {
      const announcementData = await createAnnouncementMutation(
        createEmptyAnnouncement()
      )
      mutate(
        produce((announcements) => {
          announcements.unshift(announcementData)
        })
      )
    } catch (e) {
      onErrorToast(e)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ประกาศ</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Button leftIcon={<FaPlus />} onClick={insert}>
            เพิ่มประกาศ
          </Button>
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
