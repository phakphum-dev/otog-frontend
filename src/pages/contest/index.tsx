import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { FaTrophy } from 'react-icons/fa'
import { mutate } from 'swr'

import { AnnouncementComponent } from '@src/announcement/components/AnnouncementCarousel'
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
import { getAnnouncements, keyAnnouncement } from '@src/announcement/queries'
import clsx from 'clsx'

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
              <h1 className="font-heading text-4xl font-bold">
                ยังไม่มีการแข่งขัน
              </h1>
              <NextLink passHref legacyBehavior href="/contest/history">
                <Button>ประวัติการแข่งขัน</Button>
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
          <h1 className="text-center font-heading text-4xl font-bold">
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
      <AnnouncementComponent defaultShow={true} contestId={contest.id} />
      <TitleLayout>
        <Title icon={<FaTrophy />} lineClamp>
          {contest.name}
        </Title>
        <h2 className="whitespace-nowrap font-heading text-4xl font-bold">
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!OFFLINE_MODE) return
    const distanceBetween = (
      p1x: number,
      p1y: number,
      p2x: number,
      p2y: number
    ) => {
      const dx = p1x - p2x
      const dy = p1y - p2y
      return Math.sqrt(dx * dx + dy * dy)
    }
    const onMouseMove = (event: MouseEvent) => {
      const button = buttonRef.current
      if (!button) return
      const width = button.offsetWidth
      const height = button.offsetHeight
      const radius = Math.max(width * 0.75, height * 0.75, 100)

      const parent = button.parentNode as HTMLDivElement
      const bx = parent.offsetLeft + button.offsetLeft + width / 2
      const by = parent.offsetTop + button.offsetTop + height / 2

      const dist = distanceBetween(event.clientX, event.clientY, bx, by)
      const angle = Math.atan2(event.clientY - by, event.clientX - bx)

      const ox = -1 * Math.cos(angle) * Math.max(radius - dist, 0)
      const oy = -1 * Math.sin(angle) * Math.max(radius - dist, 0)

      const rx = oy / 2
      const ry = -ox / 2

      button.style.transform = `translate(${ox}px, ${oy}px) rotateX(${rx}deg) rotateY(${ry}deg)`
      button.style.boxShadow = `0px ${Math.abs(oy)}px ${
        (Math.abs(oy) / radius) * 40
      }px rgba(0,0,0,0.15)`
    }
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('mousedown', onMouseMove)
    }
  }, [])

  return (
    <PageContainer className="flex">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-center font-heading text-4xl font-bold">
            การแข่งขัน {contest.name} จบลงแล้ว
          </h1>
          <div className="relative">
            <NextLink
              passHref
              legacyBehavior
              href={
                OFFLINE_MODE
                  ? '/easter_egg.gif'
                  : `/contest/history/${contest.id}`
              }
            >
              <Button
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'all 0.1s ease',
                }}
                className={clsx(
                  OFFLINE_MODE &&
                    "cursor-none after:absolute after:left-0 after:top-0 after:-z-10 after:h-full after:w-full after:rounded-md after:bg-otog-200 after:content-[''] after:-translate-z-2"
                )}
                ref={buttonRef}
                colorScheme="otog"
              >
                สรุปผลการแข่งขัน
              </Button>
            </NextLink>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export const getServerSideProps = withSession(async () => {
  const time = getServerTime()
  const contest = await getCurrentContest()
  if (contest) {
    const announcement = getAnnouncements(contest.id)
    return {
      props: {
        fallback: {
          'contest/now': contest,
          time: await time,
          [keyAnnouncement(contest?.id)]: await announcement,
        },
      },
    }
  }
  return {
    props: {
      fallback: {
        'contest/now': contest,
        time: await time,
      },
    },
  }
})
