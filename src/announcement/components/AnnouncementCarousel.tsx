import { Collapse } from '@chakra-ui/transition'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { FaPencilAlt, FaPlus } from 'react-icons/fa'

import { useAnnouncements } from '../queries'
import { Announcement } from '../types'
import { ReadonlyEditor } from './AnnouncementEditor'
import { AnnouncementModal } from './AnnouncementModal'
import { HEIGHT, INTERVAL, SHOWUP_DELAY } from './constants'
import {
  AnnouncementProvider,
  useAnnouncementContext,
} from './useAnnouncementContext'

import { useAuth } from '@src/context/AuthContext'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { IconButton } from '@src/ui/IconButton'

const MotionDiv = motion.div

export interface AnnouncementCarouselProps {
  defaultShow?: boolean
}

export const AnnouncementCarousel = (props: AnnouncementCarouselProps) => {
  const { defaultShow = false } = props
  const [show, setShow] = useState(false)
  const { isAuthenticated, isAdmin } = useAuth()

  const { data } = useAnnouncements()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  useEffect(() => {
    if (data) setAnnouncements(data)
  }, [data])

  const filteredAnnouncements = useMemo(
    () => data?.filter((announcements) => announcements.show) ?? [],
    [data]
  )

  useEffect(() => {
    if (isAuthenticated && (filteredAnnouncements.length > 0 || isAdmin)) {
      const timeout = setTimeout(
        () => setShow(true),
        defaultShow ? 0 : SHOWUP_DELAY
      )
      return () => clearTimeout(timeout)
    }
  }, [isAdmin, isAuthenticated, filteredAnnouncements, defaultShow])

  return (
    <Collapse in={show}>
      {show && (
        <AnnouncementProvider
          value={{ announcements, setAnnouncements, filteredAnnouncements }}
        >
          <AnnouncementComponent />
        </AnnouncementProvider>
      )}
    </Collapse>
  )
}

const AnnouncementComponent = () => {
  const { isAuthenticated, isAdmin } = useAuth()
  const {
    nextShowIndex,
    filteredAnnouncements,
    showIndex,
    announcements,
    insertIndex,
  } = useAnnouncementContext()

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
    <div className="relative flex h-[150px] cursor-pointer pt-4">
      {filteredAnnouncements.map((announcement, index, all) => (
        <MotionDiv
          key={announcement.id}
          variants={{
            show: { y: 0, transition: { duration: 0.5 } },
            hidden: { y: -HEIGHT * 1.2, transition: { duration: 0.5 } },
          }}
          className="absolute flex h-[150px] max-h-[150px] w-full justify-center overflow-hidden bg-white text-center dark:bg-gray-800"
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
            className="absolute right-0 top-4 z-10"
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
