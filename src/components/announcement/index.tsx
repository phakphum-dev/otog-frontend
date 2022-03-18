import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Descendant } from 'slate'

import { AnnouncementEditor, ReadonlyEditor } from './AnnouncementEditor'
import { HEIGHT, INTERVAL, SHOWUP_DELAY } from './constants'

import { Collapse, Stack, StackProps, useColorMode } from '@chakra-ui/react'

import { useAuth } from '@src/api/AuthProvider'

function createDescendant(value: string): Descendant[] {
  return [
    {
      type: 'paragraph',
      children: [{ text: value }],
    },
  ]
}

const initialAnnouncements = [
  {
    id: 1,
    value: createDescendant(''),
  },
  //   { id: 2, value: createDescendant('aaaeeaaaeeaaa') },
  // {
  //   id: 3,
  //   value: createDescendant(
  //     'Playing Getting Over It for the first time today!'
  //   ),
  // },
  //   { id: 4, value: createDescendant('I burned my tongue') },
  //   {
  //     id: 5,
  //     value: createDescendant(
  //       'Helloo \nPushing back SpongeBob about an hour!! Maybe a little more, but hopefully just an hour. See ya soon !'
  //     ),
  //   },
  //   { id: 6, value: createDescendant('อ่านโจทย์ให้ครบก่อนทำน่ะ') },
  //   { id: 7, value: createDescendant('ญินดีร์ฏ้อณลับสูเก็ดเฎอร์ฌาวไฑย') },
  //   { id: 8, value: createDescendant('จงทำโจทย์ !!!') },
]

const MotionStack = motion<StackProps>(Stack)

export const Announcement = () => {
  const [show, setShow] = useState(false)
  const { isAuthenticated } = useAuth()

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
      </Stack>
      <AnnouncementEditor
        value={announcements[0].value}
        onChange={(value) => {
          setAnnouncements([
            { ...announcements[0], value },
            ...announcements.slice(1),
          ])
        }}
      />
    </Collapse>
  )
}
