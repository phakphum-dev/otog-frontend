import { Collapse } from '@chakra-ui/transition'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaPencilAlt, FaPlus } from 'react-icons/fa'

import { createAnnouncement, useAnnouncements } from '../queries'
import { ReadonlyEditor } from './AnnouncementEditor'
import { AnnouncementModal } from './AnnouncementModal'
import { HEIGHT, INTERVAL } from './constants'

import { useUserData } from '@src/context/UserContext'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { IconButton } from '@src/ui/IconButton'
import { Announcement } from '../types'
import { useMutation } from '@src/hooks/useMutation'
import { createEmptyAnnouncement } from './utils'
import produce from 'immer'
import { onErrorToast } from '@src/hooks/useErrorToast'

const MotionDiv = motion.div

export interface AnnouncementCarouselProps {
  defaultShow?: boolean
}

export const AnnouncementCarousel = (props: AnnouncementCarouselProps) => {
  const { defaultShow = false } = props
  const [show, setShow] = useState(defaultShow)
  const { isAuthenticated, isAdmin } = useUserData()

  const { data: announcements } = useAnnouncements()

  const filteredAnnouncements = useMemo(
    () => announcements?.filter((announcements) => announcements.show) ?? [],
    [announcements]
  )

  const hasAnnouncement =
    isAuthenticated && (filteredAnnouncements.length > 0 || isAdmin)
  useEffect(() => {
    if (hasAnnouncement) {
      setShow(true)
    }
  }, [hasAnnouncement])

  return hasAnnouncement ? (
    <Collapse in={hasAnnouncement && show}>
      <AnnouncementComponent filteredAnnouncements={filteredAnnouncements} />
    </Collapse>
  ) : (
    <div className="mt-12" />
  )
}

export type AnnouncementComponentProps = {
  filteredAnnouncements: Announcement[]
}

const AnnouncementComponent = ({
  filteredAnnouncements,
}: AnnouncementComponentProps) => {
  const { isAuthenticated, isAdmin } = useUserData()

  const { data: announcements = [] } = useAnnouncements()
  const { mutate } = useAnnouncements()

  const [showIndex, setIndex] = useState(0)

  const nextShowIndex = useCallback(() => {
    const newIndex = (showIndex + 1) % filteredAnnouncements.length
    setIndex(newIndex)
    const matchedIndex = announcements.findIndex(
      (announcement) => announcement.id === filteredAnnouncements[newIndex].id
    )
    if (matchedIndex !== -1) setIndex(matchedIndex)
  }, [filteredAnnouncements, showIndex, announcements])

  const createAnnouncementMutation = useMutation(createAnnouncement)
  const insertIndex = async () => {
    try {
      const announcementData = await createAnnouncementMutation(
        createEmptyAnnouncement()
      )
      mutate(
        produce((announcements) => {
          announcements.push(announcementData)
        })
      )
    } catch (e) {
      onErrorToast(e)
    }
  }

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (!isOpen && isAuthenticated && filteredAnnouncements.length > 0) {
      const interval = setInterval(() => nextShowIndex(), INTERVAL)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, showIndex, filteredAnnouncements, nextShowIndex, isOpen])
  const hasAnnouncements = announcements.length > 0
  const firstCreate = async () => {
    await insertIndex()
    onOpen()
  }

  return (
    <div className="group relative my-8 flex h-[180px] cursor-pointer select-none">
      {filteredAnnouncements.map((announcement, index, all) => (
        <MotionDiv
          key={announcement.id}
          variants={{
            show: { y: 0, transition: { duration: 0.5 } },
            hidden: { y: -HEIGHT * 1.2, transition: { duration: 0.5 } },
          }}
          className="absolute flex h-[180px] max-h-[180px] w-full items-center justify-center overflow-hidden rounded-lg border bg-white text-center dark:bg-gray-800"
          style={{ zIndex: all.length - index }}
          animate={index >= showIndex ? 'show' : 'hidden'}
          onClick={nextShowIndex}
        >
          <ReadonlyEditor value={announcement.value} />
        </MotionDiv>
      ))}
      {isAdmin && (
        <>
          <IconButton
            className="invisible absolute right-0 top-0 z-10 group-hover:visible"
            aria-label="edit-announcements"
            icon={hasAnnouncements ? <FaPencilAlt /> : <FaPlus />}
            onClick={hasAnnouncements ? onOpen : firstCreate}
            variant="ghost"
          />
          {isOpen && hasAnnouncements && (
            <AnnouncementModal onClose={onClose} isOpen={isOpen} />
          )}
        </>
      )}
    </div>
  )
}
