import React, { useMemo } from 'react'
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
import { ButtonGroup, IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { HTMLMotionProps, motion } from 'framer-motion'
import { HTMLChakraProps, useTheme } from '@chakra-ui/system'
import { Title, TitleLayout } from '@src/components/Title'
import { FaTrophy } from 'react-icons/fa'
import { Box, Link } from '@chakra-ui/layout'
import { CgDetailsLess, CgDetailsMore } from 'react-icons/cg'
import { ContestScoreboard, UserWithSubmission } from '@src/hooks/useContest'

import { API_HOST, getServerSideFetch } from '@src/api'
import { GetServerSideProps } from 'next'
import { sum } from '@src/utils'
import { Tooltip } from '@chakra-ui/tooltip'
import { ONE_SECOND } from '@src/hooks/useTimer'
import Head from 'next/head'

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
}

export default function ContestHistory(props: ContestHistoryProps) {
  const { scoreboard } = props

  const getTotalScore = (user: UserWithSubmission) =>
    sum(user.submissions.map((submission) => submission.score))

  const users = useMemo(() => {
    const scored = scoreboard.users.map((user) => ({
      ...user,
      totalScore: getTotalScore(user),
    }))
    const sorted = scored.sort((a, b) => b.totalScore - a.totalScore)
    var latestRank = 0
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
  }, [])

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
          <Tbody>
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
                <Td isTruncated>{user.showName}</Td>
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
    </PageContainer>
  )
}

export { getNotFound as getServerSideProps } from '@src/api'
const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  return getServerSideFetch<ContestHistoryProps>(context, async (api) => ({
    scoreboard: await api.get<ContestScoreboard>(`contest/${id}/scoreboard`),
  }))
}
