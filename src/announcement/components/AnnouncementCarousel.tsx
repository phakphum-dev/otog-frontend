import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { FaPencilAlt } from 'react-icons/fa'

import { useAnnouncements } from '../queries/useAnnouncements'
import { ReadonlyEditor } from './AnnouncementEditor'
import { AnnouncementModal } from './AnnouncementModal'
import { HEIGHT, INTERVAL, SHOWUP_DELAY } from './constants'
import { Announcement } from './types'
import {
  AnnouncementProvider,
  useAnnouncementContext,
} from './useAnnouncementContext'

import {
  Collapse,
  IconButton,
  Stack,
  StackProps,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react'

import { useAuth } from '@src/api/AuthProvider'

const MotionStack = motion<StackProps>(Stack)

export const AnnouncementCarousel = () => {
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
      const timeout = setTimeout(() => setShow(true), SHOWUP_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [isAdmin, isAuthenticated, filteredAnnouncements])

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
  } = useAnnouncementContext()

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (!isOpen && isAuthenticated && filteredAnnouncements.length > 0) {
      const interval = setInterval(() => nextShowIndex(), INTERVAL)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, showIndex, filteredAnnouncements, nextShowIndex, isOpen])

  const { colorMode } = useColorMode()
  return (
    <Stack
      spacing={0}
      position="relative"
      height={HEIGHT}
      cursor="pointer"
      pt={4}
    >
      {filteredAnnouncements.map((announcement, index, all) => (
        <MotionStack
          key={announcement.id}
          variants={{
            show: { y: 0, transition: { duration: 0.5 } },
            hidden: { y: -HEIGHT * 1.2, transition: { duration: 0.5 } },
          }}
          animate={index >= showIndex ? 'show' : 'hidden'}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          zIndex={all.length - index}
          position="absolute"
          justify="center"
          height={HEIGHT}
          maxHeight={HEIGHT}
          width="100%"
          overflow="hidden"
          textAlign="center"
          onClick={nextShowIndex}
        >
          <ReadonlyEditor value={announcement.value} />
        </MotionStack>
      ))}
      {isAdmin && (
        <>
          <IconButton
            aria-label="edit-announcements"
            position="absolute"
            right={0}
            top={4}
            zIndex={49}
            icon={<FaPencilAlt />}
            onClick={onOpen}
            variant="ghost"
          />
          {isOpen && <AnnouncementModal onClose={onClose} isOpen={isOpen} />}
        </>
      )}
    </Stack>
  )
}
