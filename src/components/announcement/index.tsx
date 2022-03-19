import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaPencilAlt } from 'react-icons/fa'

import { ReadonlyEditor } from './AnnouncementEditor'
import { AnnouncementModal } from './AnnouncementModal'
import { HEIGHT, INTERVAL, SHOWUP_DELAY } from './constants'
import { Announcement } from './types'
import { AnnouncementProvider, useAnnouncement } from './useAnnouncement'
import { createDescendant } from './utils'

import {
  Collapse,
  IconButton,
  Stack,
  StackProps,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react'

import { useAuth } from '@src/api/AuthProvider'

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    value: createDescendant('aaaeeaaaeeaaa'),
    show: true,
  },
  // { id: 2, value: createDescendant('aaaeeaaaeeaaa'), show: false },
  {
    id: 3,
    value: createDescendant(
      'Playing Getting Over It for the first time today!'
    ),
    show: true,
  },
  // { id: 4, value: createDescendant('I burned my tongue'), show: true },
  // {
  //   id: 5,
  //   value: createDescendant(
  //     'Helloo \nPushing back SpongeBob about an hour!! Maybe a little more, but hopefully just an hour. See ya soon !'
  //   ),
  //   show: true,
  // },
  // { id: 6, value: createDescendant('อ่านโจทย์ให้ครบก่อนทำน่ะ'), show: true },
  // {
  //   id: 7,
  //   value: createDescendant('ญินดีร์ฏ้อณลับสูเก็ดเฎอร์ฌาวไฑย'),
  //   show: true,
  // },
  // { id: 8, value: createDescendant('จงทำโจทย์ !!!'), show: true },
]

const MotionStack = motion<StackProps>(Stack)

export const AnnouncementCarousel = () => {
  const [show, setShow] = useState(false)
  const { isAuthenticated } = useAuth()
  const [announcements, setAnnouncements] = useState(initialAnnouncements)

  useEffect(() => {
    if (isAuthenticated && announcements.length > 0) {
      const timeout = setTimeout(() => setShow(true), SHOWUP_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [isAuthenticated, announcements])

  return (
    <Collapse in={show}>
      {show && (
        <AnnouncementProvider value={{ announcements, setAnnouncements }}>
          <AnnouncementComponent />
        </AnnouncementProvider>
      )}
    </Collapse>
  )
}

const AnnouncementComponent = () => {
  const { isAuthenticated, isAdmin } = useAuth()
  const { nextIndex, announcements, currentIndex } = useAnnouncement()

  const { isOpen, onOpen, onClose } = useDisclosure()
  useEffect(() => {
    if (!isOpen && isAuthenticated && announcements.length > 0) {
      const interval = setInterval(() => nextIndex(), INTERVAL)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, currentIndex, announcements, nextIndex, isOpen])

  const { colorMode } = useColorMode()
  return (
    <Stack
      spacing={0}
      position="relative"
      height={HEIGHT}
      cursor="pointer"
      pt={4}
    >
      {announcements.map((announcement, index, all) => (
        <MotionStack
          key={announcement.id}
          variants={{
            show: { y: 0, transition: { duration: 0.5 } },
            hidden: { y: -HEIGHT, transition: { duration: 0.5 } },
          }}
          animate={index >= currentIndex ? 'show' : 'hidden'}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          zIndex={all.length - index}
          position="absolute"
          justify="center"
          height={HEIGHT}
          width="100%"
          overflow="hidden"
          textAlign="center"
          onClick={nextIndex}
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
            zIndex={50}
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
