import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import {
  Collapse,
  Stack,
  StackProps,
  Text,
  useColorMode,
} from '@chakra-ui/react'

import { useAuth } from '@src/api/AuthProvider'

const announcements = [
  'Announcement of otog.cf',
  'aaaeeaaaeeaaa',
  'Playing Getting Over It for the first time today!',
  'I burned my tongue',
  'Helloo \nPushing back SpongeBob about an hour!! Maybe a little more, but hopefully just an hour. See ya soon !',
  'อ่านโจทย์ให้ครบก่อนทำน่ะ',
  'ญินดีร์ฏ้อณลับสูเก็ดเฎอร์ฌาวไฑย',
  'จงทำโจทย์ !!!',
]

const MotionStack = motion<StackProps>(Stack)

const HEIGHT = 150
const SHOWUP_DELAY = 500
const INTERVAL = 5000

export const Announcement = () => {
  const [show, setShow] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && announcements.length) {
      const timeout = setTimeout(() => setShow(true), SHOWUP_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [isAuthenticated])
  const [showIndex, setIndex] = useState(0)
  const next = () => {
    setIndex((index) => (index + 1) % announcements.length)
  }
  useEffect(() => {
    if (isAuthenticated && announcements.length) {
      const interval = setInterval(() => next(), INTERVAL)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, showIndex])

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
            key={index}
            position="absolute"
            justify="center"
            variants={{
              show: { y: 0, transition: { duration: 0.5 } },
              hidden: { y: -HEIGHT, transition: { duration: 0.5 } },
            }}
            animate={index >= showIndex ? 'show' : 'hidden'}
            height={HEIGHT}
            width="100%"
            bg={colorMode === 'light' ? 'white' : 'gray.800'}
            zIndex={all.length - index}
            overflow="hidden"
          >
            <Text fontSize="3xl" textAlign="center" fontWeight="bold">
              {announcement}
            </Text>
          </MotionStack>
        ))}
      </Stack>
    </Collapse>
  )
}
