import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { FaTrophy } from 'react-icons/fa'
import { mutate } from 'swr'

import { Center, Heading } from '@chakra-ui/layout'

import { AnnouncementCarousel } from '@src/announcement/components/AnnouncementCarousel'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { OFFLINE_MODE } from '@src/config'
import { TaskCard } from '@src/contest/TaskCard'
import { getCurrentContest, useCurrentContest } from '@src/contest/queries'
import { Contest } from '@src/contest/types'
import { withCookies } from '@src/context/HttpClient'
import { Button } from '@src/ui/Button'
import { toThTimeFormat, toTimerFormat } from '@src/utils/time'
import {
  getServerTime,
  useServerTime,
  useTimer,
} from '@src/utils/time/useTimer'

export default function ContestPage() {
  const { data: serverTime } = useServerTime()
  const { data: currentContest } = useCurrentContest()

  return (
    <>
      <Head>
        <title>Contest | OTOG</title>
      </Head>
      {currentContest ? (
        <ContestRouter contest={currentContest} time={serverTime!} />
      ) : (
        <PageContainer display="flex">
          <Center flex={1}>
            <div className="flex flex-col items-center gap-4">
              <Heading>ยังไม่มีการแข่งขัน</Heading>
              <NextLink href="/contest/history" passHref>
                <Button as="a">ประวัติการแข่งขัน</Button>
              </NextLink>
            </div>
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
  const { data: serverTime } = useServerTime()
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
  const { data: serverTime } = useServerTime()
  const remaining = useTimer(serverTime || time, contest.timeStart)
  useEffect(() => {
    if (remaining <= 0) {
      mutate('time')
    }
  }, [remaining])
  return (
    <PageContainer display="flex">
      <Center flex={1}>
        <div className="flex flex-col items-center gap-4">
          <Heading textAlign="center">
            การแข่งขัน {contest.name} กำลังจะเริ่ม
          </Heading>
          <Heading as="h2" fontSize="2xl">
            ในอีก {toThTimeFormat(remaining)}...
          </Heading>
        </div>
      </Center>
    </PageContainer>
  )
}

export const MidContest = (props: ContestProps) => {
  const { contest } = props
  const { data: serverTime } = useServerTime()
  const remaining = useTimer(serverTime!, contest.timeEnd)
  const router = useRouter()
  useEffect(() => {
    if (remaining <= 0) {
      if (OFFLINE_MODE) {
        mutate('time')
      } else {
        router.push(`/contest/history/${contest.id}`)
      }
    }
  }, [remaining, contest.id, router])
  return (
    <PageContainer maxSize="md">
      <AnnouncementCarousel defaultShow={true} />
      <TitleLayout>
        <Title icon={FaTrophy} lineClamp>
          {contest.name}
        </Title>
        <Heading as="h2" whiteSpace="nowrap">
          {toTimerFormat(remaining)}
        </Heading>
      </TitleLayout>

      <div className="flex flex-col gap-6">
        {contest.problems.map((prob) => (
          <TaskCard contestId={contest.id} key={prob.id} problem={prob} />
        ))}
      </div>
    </PageContainer>
  )
}

export const PostContest = (props: ContestProps) => {
  const { contest } = props
  return (
    <PageContainer display="flex">
      <Center flex={1}>
        <div className="flex flex-col items-center gap-4">
          <Heading textAlign="center">
            การแข่งขัน {contest.name} จบลงแล้ว
          </Heading>
          <NextLink
            href={
              OFFLINE_MODE
                ? '/easter_egg.gif'
                : `/contest/history/${contest.id}`
            }
            passHref
          >
            <Button as="a" colorScheme="otog">
              สรุปผลการแข่งขัน
            </Button>
          </NextLink>
        </div>
      </Center>
    </PageContainer>
  )
}

export const getServerSideProps = withCookies(async () => {
  const contest = getCurrentContest()
  const time = getServerTime()
  return {
    props: {
      fallback: {
        'contest/now': await contest,
        time: await time,
      },
    },
  }
})
