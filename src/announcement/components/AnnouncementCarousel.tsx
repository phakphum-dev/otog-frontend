import { Collapse } from '@chakra-ui/transition'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaPencilAlt, FaPlus } from 'react-icons/fa'

import { useAnnouncements } from '../queries'
import { ReadonlyEditor } from './AnnouncementEditor'
import { AnnouncementModal } from './AnnouncementModal'
import { HEIGHT, INTERVAL } from './constants'

import { useUserData } from '@src/context/UserContext'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { IconButton } from '@src/ui/IconButton'
import { Announcement } from '../types'
import { AnnouncementProvider } from './AnnouncementProvier'

const MotionDiv = motion.div

export interface AnnouncementCarouselProps {
  defaultShow?: boolean
  contestId?: number
}

export const AnnouncementComponent = (props: AnnouncementCarouselProps) => {
  const { defaultShow, contestId } = props
  return (
    <AnnouncementProvider value={{ contestId }}>
      <AnnouncementCarousel defaultShow={defaultShow} />
    </AnnouncementProvider>
  )
}

export const AnnouncementCarousel = (props: AnnouncementCarouselProps) => {
  const { defaultShow = false } = props
  const [show, setShow] = useState(defaultShow)
  const { isAdmin } = useUserData()

  const { data: announcements } = useAnnouncements()

  const shownAnnouncements = useMemo(
    () => announcements?.filter((announcements) => announcements.show) ?? [],
    [announcements]
  )

  const hasAnnouncement = shownAnnouncements.length > 0 || isAdmin
  useEffect(() => {
    setShow(hasAnnouncement)
  }, [hasAnnouncement])

  return hasAnnouncement ? (
    <Collapse in={hasAnnouncement && show}>
      <AnnouncementCards shownAnnouncements={shownAnnouncements} />
    </Collapse>
  ) : (
    <div className="mt-12" />
  )
}

export type AnnouncementCardsProps = {
  shownAnnouncements: Announcement[]
}

const AnnouncementCards = ({ shownAnnouncements }: AnnouncementCardsProps) => {
  const { isAuthenticated, isAdmin } = useUserData()

  const { data: announcements = [] } = useAnnouncements()

  const [showIndex, setIndex] = useState(0)

  const nextShowIndex = useCallback(() => {
    const newIndex = (showIndex + 1) % shownAnnouncements.length
    setIndex(newIndex)
  }, [shownAnnouncements, showIndex])

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (!isOpen && isAuthenticated && shownAnnouncements.length > 1) {
      const interval = setInterval(() => nextShowIndex(), INTERVAL)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, showIndex, shownAnnouncements, nextShowIndex, isOpen])
  const hasAnnouncements = announcements.length > 0

  return (
    <div className="group relative my-8 flex h-[180px] cursor-pointer select-none">
      {shownAnnouncements.map((announcement, index, all) => (
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
            onClick={onOpen}
            variant="ghost"
          />
          {isOpen && <AnnouncementModal onClose={onClose} isOpen={isOpen} />}
        </>
      )}
    </div>
  )
}
