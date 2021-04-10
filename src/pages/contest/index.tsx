import { Center, Heading, Stack, VStack } from '@chakra-ui/layout'
import { PageContainer } from '@src/components/PageContainer'
import { TaskCard } from '@src/components/TaskCard'
import { Title } from '@src/components/Title'
import { FaTrophy } from 'react-icons/fa'

import { getServerSideFetch } from '@src/utils/api'
import { GetServerSideProps } from 'next'
import { Contest, useCurrentContest } from '@src/utils/api/Contest'
import { Button } from '@chakra-ui/button'
import NextLink from 'next/link'
import {
  toThTimeFormat,
  toTimerFormat,
  useServerTime,
  useTimer,
} from '@src/utils/hooks/useTimer'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { OrangeButton } from '@src/components/OrangeButton'
import { mutate } from 'swr'

export interface ContestPageProps {
  initialData: {
    contest: Contest | null
    serverTime: string
  }
}

export default function ContestPage(props: ContestPageProps) {
  const {
    initialData: { contest, serverTime },
  } = props
  const { data: currentContest } = useCurrentContest(contest)

  return currentContest ? (
    <ContestRouter contest={currentContest} time={serverTime} />
  ) : (
    <PageContainer display="flex">
      <Center flex={1}>
        <VStack spacing={4}>
          <Heading>ยังไม่มีการแข่งขัน</Heading>
          <NextLink href="/contest/history">
            <Button>ประวัติการแข่งขัน</Button>
          </NextLink>
        </VStack>
      </Center>
    </PageContainer>
  )
}
export interface ContestProps {
  contest: Contest
  time: string
}

export function ContestRouter(props: ContestProps) {
  const { contest, time } = props
  const { data: serverTime } = useServerTime(time)
  const currentTime = new Date(serverTime || time)
  const startTime = new Date(contest.timeStart)
  const endTime = new Date(contest.timeEnd)
  if (currentTime < startTime) {
    return <PreContest {...props} />
  }
  if (currentTime < endTime) {
    return <MidContest {...props} />
  }
  return <PostContest {...props} />
}

export function PreContest(props: ContestProps) {
  const { contest, time } = props
  const { data: serverTime } = useServerTime(time)
  const remaining = useTimer(serverTime || time, contest.timeStart)
  useEffect(() => {
    if (remaining <= 0) {
      mutate('time')
    }
  }, [remaining])
  return (
    <PageContainer display="flex">
      <Center flex={1}>
        <VStack spacing={4}>
          <Heading>การแข่งขัน {contest.name} กำลังจะเริ่ม</Heading>
          <Heading as="h2" fontSize="2xl">
            ในอีก {toThTimeFormat(remaining)}...
          </Heading>
        </VStack>
      </Center>
    </PageContainer>
  )
}

export function MidContest(props: ContestProps) {
  const { contest, time } = props
  const { data: serverTime } = useServerTime(time)
  const remaining = useTimer(serverTime || time, contest.timeEnd)
  const router = useRouter()
  useEffect(() => {
    if (remaining <= 0) {
      router.push(`/contest/history/${contest.id}`)
    }
  }, [remaining])
  return (
    <PageContainer dense>
      <Stack direction="row" justify="space-between" align="baseline">
        <Title icon={FaTrophy}>แข่งขัน</Title>
        <Heading as="h2">{toTimerFormat(remaining)}</Heading>
      </Stack>

      <Stack spacing={6}>
        {contest.problems.map((prob) => (
          <TaskCard contestId={contest.id} key={prob.id} problem={prob} />
        ))}
      </Stack>
    </PageContainer>
  )
}

export function PostContest(props: ContestProps) {
  const { contest } = props
  return (
    <PageContainer display="flex">
      <Center flex={1}>
        <VStack spacing={4}>
          <Heading>การแข่งขันจบลงแล้ว</Heading>
          <NextLink href={`/contest/history/${contest.id}`}>
            <OrangeButton>สรุปผลการแข่งขัน</OrangeButton>
          </NextLink>
        </VStack>
      </Center>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return getServerSideFetch<{
    contest: Contest | null
    serverTime: string
  }>(async (api) => {
    const contest = await api.get<Contest | null>('contest/now')
    const serverTime = await api.get<string>('time')
    return { contest, serverTime }
  }, context)
}
