import React from 'react'
import {
  Table,
  TableCellProps,
  Tbody,
  Th as THead,
  Td as TData,
  Thead,
  Tr,
  TableColumnHeaderProps,
} from '@chakra-ui/table'
import { PageContainer } from '@src/components/PageContainer'
import { useRouter } from 'next/router'
import { Button, ButtonGroup, IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { HTMLMotionProps, motion } from 'framer-motion'
import { HTMLChakraProps, useTheme } from '@chakra-ui/system'
import { Title } from '@src/components/Title'
import { FaTrophy } from 'react-icons/fa'
import { Stack } from '@chakra-ui/layout'
import { CgDetailsLess, CgDetailsMore } from 'react-icons/cg'

const Th = (props: TableColumnHeaderProps) => (
  <THead textAlign="center" {...props} />
)
const Td = (props: TableCellProps) => (
  <TData textAlign="center" lineHeight={undefined} py={2} {...props} />
)

type Merge<P, T> = Omit<P, keyof T> & T
type MotionTrProps = Merge<HTMLChakraProps<'tr'>, HTMLMotionProps<'tr'>>
type MotionThProps = Merge<HTMLChakraProps<'th'>, HTMLMotionProps<'th'>>
type MotionTdProps = Merge<HTMLChakraProps<'td'>, HTMLMotionProps<'td'>>
export const MotionTh: React.FC<MotionThProps> = motion(THead)
export const MotionTd: React.FC<MotionTdProps> = motion(TData)
export const MotionTr: React.FC<MotionTrProps> = motion(Tr)

const fontSize: Record<number, string> = {
  1: '5xl',
  2: '4xl',
  3: '3xl',
  4: '2xl',
  5: 'xl',
  6: 'md',
}

const mockScoreboard = [
  {
    rank: 1,
    name: 'Chomtana',
    score: 313,
    time: 8.98,
    scores: [100, 50, 75],
  },
  {
    rank: 2,
    name: 'Minerva',
    score: 305,
    time: 6.24,
    scores: [100, 50, 75],
  },
  {
    rank: 2,
    name: 'BnTP',
    score: 300,
    time: 6.42,
    scores: [100, 50, 75],
  },
  {
    rank: 3,
    name: 'BnTP',
    score: 313,
    time: 8.98,
    scores: [100, 50, 75],
  },
  {
    rank: 4,
    name: 'BnTP',
    score: 313,
    time: 8.98,
    scores: [100, 50, 75],
  },
  {
    rank: 5,
    name: 'BnTP',
    score: 313,
    time: 8.98,
    scores: [100, 50, 75],
  },
  {
    rank: 6,
    name: 'BnTP',
    score: 313,
    time: 8.98,
    scores: [100, 50, 75],
  },
  {
    rank: 6,
    name: 'BnTP',
    score: 313,
    time: 8.98,
    scores: [100, 50, 75],
  },
  {
    rank: 6,
    name: 'BnTP',
    score: 313,
    time: 8.98,
    scores: [100, 50, 75],
  },
]

export default function ContestHistory() {
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const theme = useTheme()

  return (
    <PageContainer>
      <Stack direction="row" justify="space-between" align="center">
        <Title icon={FaTrophy}>การแข่งขัน</Title>
        <ButtonGroup isAttached variant="outline">
          <IconButton
            aria-label="less-detail"
            onClick={onClose}
            isActive={!isOpen}
            icon={<CgDetailsLess />}
          >
            Undetailed
          </IconButton>
          <IconButton
            aria-label="more-detail"
            onClick={onOpen}
            isActive={isOpen}
            icon={<CgDetailsMore />}
          >
            Detailed
          </IconButton>
        </ButtonGroup>
      </Stack>
      <Table variant={isOpen ? 'simple' : 'unstyled'}>
        <Thead>
          <Tr whiteSpace="nowrap">
            <Th>#</Th>
            <Th>ชื่อ</Th>
            <Th>คะแนนรวม</Th>
            {isOpen && (
              <>
                <MotionTh textAlign="center">ข้อที่ 1</MotionTh>
                <MotionTh textAlign="center">ข้อที่ 2</MotionTh>
                <MotionTh textAlign="center">ข้อที่ 3</MotionTh>
              </>
            )}
            <Th>เวลาที่ใช้</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mockScoreboard.map((player) => (
            <MotionTr
              animate={isOpen ? 'small' : 'large'}
              initial="large"
              variants={{
                small: {
                  fontSize: theme.fontSizes['md'],
                },
                large: { fontSize: theme.fontSizes[fontSize[player.rank]] },
              }}
            >
              <Td>{player.rank}</Td>
              <Td>{player.name}</Td>
              <Td>{player.score}</Td>
              {isOpen && (
                <>
                  <MotionTd textAlign="center">{player.scores[0]}</MotionTd>
                  <MotionTd textAlign="center">{player.scores[1]}</MotionTd>
                  <MotionTd textAlign="center">{player.scores[1]}</MotionTd>
                </>
              )}
              <Td>{player.time}</Td>
            </MotionTr>
          ))}
        </Tbody>
      </Table>
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
