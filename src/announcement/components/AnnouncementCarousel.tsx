import { Collapse } from '@chakra-ui/transition'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { FaPencilAlt, FaPlus } from 'react-icons/fa'

import { useAnnouncements } from '../queries'
import { Announcement } from '../types'
import { ReadonlyEditor } from './AnnouncementEditor'
import { AnnouncementModal } from './AnnouncementModal'
import { HEIGHT, INTERVAL } from './constants'
import {
  AnnouncementProvider,
  useAnnouncementContext,
} from './useAnnouncementContext'

import { useUserData } from '@src/context/UserContext'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { IconButton } from '@src/ui/IconButton'

const MotionDiv = motion.div

export interface AnnouncementCarouselProps {
  defaultShow?: boolean
}

export const AnnouncementCarousel = (props: AnnouncementCarouselProps) => {
  const { defaultShow = false } = props
  const [show, setShow] = useState(defaultShow)
  const { isAuthenticated, isAdmin } = useUserData()

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
      setShow(true)
    }
  }, [isAdmin, isAuthenticated, filteredAnnouncements, defaultShow])

  return (
    <Collapse in={show}>
      <AnnouncementProvider
        value={{ announcements, setAnnouncements, filteredAnnouncements }}
      >
        <AnnouncementComponent />
      </AnnouncementProvider>
    </Collapse>
  )
}

const AnnouncementComponent = () => {
  const { isAuthenticated, isAdmin } = useUserData()
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
