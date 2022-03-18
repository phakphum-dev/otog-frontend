import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { FaPencilAlt } from 'react-icons/fa'
import { Descendant } from 'slate'

import { ReadonlyEditor } from './AnnouncementEditor'
import { AnnouncementModal } from './AnnouncementModal'
import { HEIGHT, INTERVAL, SHOWUP_DELAY } from './constants'

import {
  Collapse,
  IconButton,
  Stack,
  StackProps,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react'

import { useAuth } from '@src/api/AuthProvider'

function createDescendant(value: string): Descendant[] {
  return [
    {
      type: 'heading-one',
      children: [{ text: value, bold: true }],
    },
  ]
}

const initialAnnouncements = [
  {
    id: 1,
    value: createDescendant('aaaeeaaaeeaaa'),
  },
  { id: 2, value: createDescendant('aaaeeaaaeeaaa') },
  {
    id: 3,
    value: createDescendant(
      'Playing Getting Over It for the first time today!'
    ),
  },
  { id: 4, value: createDescendant('I burned my tongue') },
  {
    id: 5,
    value: createDescendant(
      'Helloo \nPushing back SpongeBob about an hour!! Maybe a little more, but hopefully just an hour. See ya soon !'
    ),
  },
  { id: 6, value: createDescendant('อ่านโจทย์ให้ครบก่อนทำน่ะ') },
  { id: 7, value: createDescendant('ญินดีร์ฏ้อณลับสูเก็ดเฎอร์ฌาวไฑย') },
  { id: 8, value: createDescendant('จงทำโจทย์ !!!') },
]

const MotionStack = motion<StackProps>(Stack)

export const Announcement = () => {
  const [show, setShow] = useState(false)
  const { isAuthenticated, isAdmin } = useAuth()

  const [announcements, setAnnouncements] = useState(initialAnnouncements)

  useEffect(() => {
    if (isAuthenticated && announcements.length > 0) {
      const timeout = setTimeout(() => setShow(true), SHOWUP_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [isAuthenticated, announcements])
  const [showIndex, setIndex] = useState(0)
  const next = useCallback(() => {
    setIndex((index) => (index + 1) % announcements.length)
  }, [announcements])

  useEffect(() => {
    if (isAuthenticated && announcements.length > 0) {
      const interval = setInterval(() => next(), INTERVAL)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, showIndex, announcements, next])

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { colorMode } = useColorMode()
  return (
    <Collapse in={show}>
      <Stack
        spacing={0}
        position="relative"
        height={HEIGHT}
        onClick={next}
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
            animate={index >= showIndex ? 'show' : 'hidden'}
            bg={colorMode === 'light' ? 'white' : 'gray.800'}
            zIndex={all.length - index}
            position="absolute"
            justify="center"
            height={HEIGHT}
            width="100%"
            overflow="hidden"
            textAlign="center"
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
            <AnnouncementModal
              onClose={onClose}
              isOpen={isOpen}
              announcements={announcements}
              setAnnouncements={setAnnouncements}
            />
          </>
        )}
      </Stack>
    </Collapse>
  )
}
