import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { FaTrophy } from 'react-icons/fa'
import { mutate } from 'swr'

import { AnnouncementCarousel } from '@src/announcement/components/AnnouncementCarousel'
import { withSession } from '@src/api/withSession'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { OFFLINE_MODE } from '@src/config'
import { TaskCard } from '@src/contest/TaskCard'
import { getCurrentContest, useCurrentContest } from '@src/contest/queries'
import { Contest } from '@src/contest/types'
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
        <PageContainer className="flex">
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-4xl font-bold">ยังไม่มีการแข่งขัน</h1>
              <NextLink href="/contest/history" passHref legacyBehavior>
                <Button as="a">ประวัติการแข่งขัน</Button>
              </NextLink>
            </div>
          </div>
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
    <PageContainer className="flex">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-center text-4xl font-bold">
            การแข่งขัน {contest.name} กำลังจะเริ่ม
          </h1>
          <h2 className="text-center text-2xl font-bold">
            ในอีก {toThTimeFormat(remaining)}...
          </h2>
        </div>
      </div>
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
        <Title icon={<FaTrophy />} lineClamp>
          {contest.name}
        </Title>
        <h2 className="whitespace-nowrap text-4xl font-bold">
          {toTimerFormat(remaining)}
        </h2>
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
    <PageContainer className="flex">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-center text-4xl font-bold">
            การแข่งขัน {contest.name} จบลงแล้ว
          </h1>
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
      </div>
    </PageContainer>
  )
}

export const getServerSideProps = withSession(async () => {
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
