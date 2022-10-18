import { HTMLMotionProps, motion } from 'framer-motion'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import React, { useMemo } from 'react'
import { CgDetailsLess, CgDetailsMore } from 'react-icons/cg'
import { FaMedal, FaTrophy } from 'react-icons/fa'

import { ButtonGroup, IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { Box, Link, Stack } from '@chakra-ui/layout'
import { Text } from '@chakra-ui/react'
import { HTMLChakraProps, useTheme } from '@chakra-ui/system'
import {
  Td as TData,
  Th as THead,
  Table,
  TableCellProps,
  TableColumnHeaderProps,
  Tbody,
  Thead,
  Tr,
} from '@chakra-ui/table'
import { Tooltip } from '@chakra-ui/tooltip'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { API_HOST } from '@src/config'
import { ContestScoreboard, UserWithSubmission } from '@src/contest/types'
import { getServerSideFetch } from '@src/context/HttpClient'
import { sum } from '@src/utils/sum'
import { ONE_SECOND } from '@src/utils/time'

const Th = (props: TableColumnHeaderProps) => (
  <THead textAlign="center" {...props} />
)
const Td = (props: TableCellProps) => (
  <TData textAlign="center" lineHeight={undefined} py={2} {...props} />
)

type Merge<P, T> = Omit<P, keyof T> & T
type MotionTrProps = Merge<HTMLChakraProps<'tr'>, HTMLMotionProps<'tr'>>
export const MotionTr: React.FC<MotionTrProps> = motion(Tr)

const fontSize: Record<number, string> = {
  1: '5xl',
  2: '4xl',
  3: '3xl',
  4: '2xl',
  5: 'xl',
}

export interface ContestHistoryProps {
  scoreboard: ContestScoreboard
  scoreboardPrize: ContestPrize
}

type ContestPrize = Record<Prize, MiniSubmission[]>
type Prize = typeof prizes[number]
const prizes = [
  'firstBlood',
  'fasterThanLight',
  'passedInOne',
  'oneManSolve',
] as const

const prizeDescription: Record<
  Prize,
  { name: string; description: string; emoji: string }
> = {
  firstBlood: {
    name: 'First Blood',
    description: 'The first user that passed the task.',
    emoji: '💀',
  },
  fasterThanLight: {
    name: 'Faster Than Light',
    description: 'The user that solved the task with fastest algorithm.',
    emoji: '⚡️',
  },
  passedInOne: {
    name: 'Passed In One',
    description: 'The user that passed the task in one submission.',
    emoji: '🎯',
  },
  oneManSolve: {
    name: 'One Man Solve',
    description: 'The only one user that passed the task.',
    emoji: '🏅',
  },
}

type MiniSubmission = {
  id: number
  problem: {
    id: number
  }
  user: {
    id: number
    showName: string
  }
}
const getTotalScore = (user: UserWithSubmission) =>
  sum(user.submissions.map((submission) => submission.score))

export default function ContestHistory(props: ContestHistoryProps) {
  const { scoreboard, scoreboardPrize } = props

  const users = useMemo(() => {
    const scored = scoreboard.users.map((user) => ({
      ...user,
      totalScore: getTotalScore(user),
    }))
    const sorted = scored.sort((a, b) => b.totalScore - a.totalScore)
    let latestRank = 0
    return sorted.map((user, index) => {
      if (
        index > 0 &&
        sorted[index - 1].totalScore === sorted[index].totalScore
      ) {
        return { ...user, rank: latestRank }
      }
      latestRank = index + 1
      return { ...user, rank: latestRank }
    })
  }, [scoreboard])

  const { isOpen, onOpen, onClose } = useDisclosure()
  const theme = useTheme()

  return (
    <PageContainer>
      <Head>
        <title>Contest History #{scoreboard.id} | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTrophy} noOfLines={1}>
          {scoreboard.name}
        </Title>
        <ButtonGroup isAttached variant="outline">
          <IconButton
            aria-label="less-detail"
            onClick={onClose}
            isActive={!isOpen}
            icon={<CgDetailsLess />}
          />
          <IconButton
            aria-label="more-detail"
            onClick={onOpen}
            isActive={isOpen}
            icon={<CgDetailsMore />}
          />
        </ButtonGroup>
      </TitleLayout>
      <Box overflowX="auto">
        <Table variant={isOpen ? 'simple' : 'unstyled'}>
          <Thead>
            <Tr whiteSpace="nowrap">
              <Th>#</Th>
              <Th>ชื่อ</Th>
              <Th>คะแนนรวม</Th>
              {isOpen &&
                scoreboard.problems.map((problem, index) => (
                  <Th key={problem.id}>
                    <Tooltip
                      hasArrow
                      label={problem.name}
                      placement="top"
                      closeOnClick={false}
                      shouldWrapChildren
                    >
                      <Link
                        isExternal
                        href={`${API_HOST}problem/doc/${problem.id}`}
                        variant="hidden"
                      >
                        ข้อที่ {index + 1}
                      </Link>
                    </Tooltip>
                  </Th>
                ))}
              <Th>เวลาที่ใช้</Th>
            </Tr>
          </Thead>
          <Tbody sx={{ td: { lineHeight: 'normal' } }}>
            {users.map((user) => (
              <MotionTr
                key={user.id}
                animate={isOpen ? 'small' : 'large'}
                initial="large"
                variants={{
                  small: {
                    fontSize: theme.fontSizes['md'],
                  },
                  large: {
                    fontSize: theme.fontSizes[fontSize[user.rank] ?? 'md'],
                  },
                }}
              >
                <Td>{user.rank}</Td>
                <Td maxW={300} isTruncated={!isOpen}>
                  <NextLink href={`/profile/${user.id}`}>
                    <Link variant="hidden">{user.showName}</Link>
                  </NextLink>
                </Td>
                <Td>{getTotalScore(user)}</Td>
                {isOpen &&
                  scoreboard.problems.map((problem) => {
                    const submission = user.submissions.find(
                      (submission) => submission.problemId === problem.id
                    )
                    return (
                      <Td key={`${user.id}/${problem.id}`}>
                        {submission?.score ?? 0}
                      </Td>
                    )
                  })}
                <Td>
                  {sum(
                    user.submissions.map((submission) => submission.timeUsed)
                  ) / ONE_SECOND}
                </Td>
              </MotionTr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <TitleLayout mt={32}>
        <Title icon={FaMedal}>รางวัล</Title>
      </TitleLayout>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr whiteSpace="nowrap">
              <Th />
              {scoreboard.problems.map((problem) => (
                <Th key={problem.id}>
                  <Link
                    isExternal
                    href={`${API_HOST}problem/doc/${problem.id}`}
                    variant="hidden"
                  >
                    {problem.name}
                  </Link>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody sx={{ td: { lineHeight: 'normal' } }}>
            {prizes.map((prize) => {
              return (
                <Tr key={prize}>
                  <Td textAlign="left" whiteSpace="nowrap">
                    <Tooltip
                      hasArrow
                      label={prizeDescription[prize].description}
                      placement="top"
                      closeOnClick={false}
                      shouldWrapChildren
                    >
                      {prizeDescription[prize].emoji}{' '}
                      {prizeDescription[prize].name}
                    </Tooltip>
                  </Td>
                  {scoreboard.problems.map((problem) => {
                    const submissions = scoreboardPrize[prize].filter(
                      (submission) => problem.id === submission.problem.id
                    )
                    return (
                      <Td key={problem.id}>
                        <Stack>
                          {submissions.length === 0 ? (
                            <Text>-</Text>
                          ) : (
                            submissions.map((submission) => (
                              <NextLink
                                href={`/profile/${submission.user.id}`}
                                key={submission.id}
                              >
                                <Link variant="hidden" maxW={250} isTruncated>
                                  {submission.user.showName}
                                </Link>
                              </NextLink>
                            ))
                          )}
                        </Stack>
                      </Td>
                    )
                  })}
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  return getServerSideFetch<ContestHistoryProps>(context, async (client) => ({
    scoreboard: await client.get<ContestScoreboard>(`contest/${id}/scoreboard`),
    scoreboardPrize: await client.get<ContestPrize>(`contest/${id}/prize`),
  }))
}
