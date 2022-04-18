import { GetServerSideProps } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { FaTrophy } from 'react-icons/fa'
import { mutate } from 'swr'

import { Button } from '@chakra-ui/button'
import { Center, Heading, Stack, VStack } from '@chakra-ui/layout'
import { Tooltip } from '@chakra-ui/tooltip'

import { AnnouncementCarousel } from '@src/announcement/components/AnnouncementCarousel'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { TaskCard } from '@src/contest/TaskCard'
import { Contest } from '@src/contest/types'
import { useCurrentContest } from '@src/contest/useContest'
import { getServerSideFetch } from '@src/context/HttpClient'
import { toThTimeFormat, toTimerFormat } from '@src/utils/time'
import { useServerTime, useTimer } from '@src/utils/time/useTimer'

export interface ContestPageProps {
  contest: Contest | null
  serverTime: string
}

export default function ContestPage(props: ContestPageProps) {
  const { contest, serverTime } = props
  const { data: currentContest } = useCurrentContest(contest)

  return (
    <>
      <Head>
        <title>Contest | OTOG</title>
      </Head>
      {currentContest ? (
        <ContestRouter contest={currentContest} time={serverTime} />
      ) : (
        <PageContainer display="flex">
          <Center flex={1}>
            <VStack spacing={4}>
              <Heading>ยังไม่มีการแข่งขัน</Heading>
              <NextLink href="/contest/history" passHref>
                <Button as="a">ประวัติการแข่งขัน</Button>
              </NextLink>
            </VStack>
          </Center>
        </PageContainer>
      )}
    </>
  )
}
export interface ContestProps {
  contest: Contest
  time: string
}

export const ContestRouter = (props: ContestProps) => {
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

export const PreContest = (props: ContestProps) => {
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
          <Heading textAlign="center">
            การแข่งขัน {contest.name} กำลังจะเริ่ม
          </Heading>
          <Heading as="h2" fontSize="2xl">
            ในอีก {toThTimeFormat(remaining)}...
          </Heading>
        </VStack>
      </Center>
    </PageContainer>
  )
}

export const MidContest = (props: ContestProps) => {
  const { contest, time } = props
  const { data: serverTime } = useServerTime(time)
  const remaining = useTimer(serverTime || time, contest.timeEnd)
  const router = useRouter()
  useEffect(() => {
    if (remaining <= 0) {
      router.push(`/contest/history/${contest.id}`)
    }
  }, [remaining, contest.id, router])
  return (
    <PageContainer maxSize="md">
      <AnnouncementCarousel defaultShow={true} />
      <TitleLayout>
        <Tooltip label={contest.name} hasArrow placement="top">
          <Title icon={FaTrophy} noOfLines={1}>
            {contest.name}
          </Title>
        </Tooltip>
        <Heading as="h2" whiteSpace="nowrap">
          {toTimerFormat(remaining)}
        </Heading>
      </TitleLayout>

      <Stack spacing={6}>
        {contest.problems.map((prob) => (
          <TaskCard contestId={contest.id} key={prob.id} problem={prob} />
        ))}
      </Stack>
    </PageContainer>
  )
}

export const PostContest = (props: ContestProps) => {
  const { contest } = props
  return (
    <PageContainer display="flex">
      <Center flex={1}>
        <VStack spacing={4}>
          <Heading textAlign="center">
            การแข่งขัน {contest.name} จบลงแล้ว
          </Heading>
          <NextLink href={`/contest/history/${contest.id}`} passHref>
            <Button as="a" variant="otog">
              สรุปผลการแข่งขัน
            </Button>
          </NextLink>
        </VStack>
      </Center>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return getServerSideFetch<ContestPageProps>(context, async (client) => {
    const contest = await client.get<Contest | null>('contest/now')
    const serverTime = await client.get<string>('time')
    return { contest, serverTime }
  })
}
