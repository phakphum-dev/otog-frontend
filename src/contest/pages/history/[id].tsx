import clsx from 'clsx'
import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ComponentProps, useMemo } from 'react'
import { CgDetailsLess, CgDetailsMore } from 'react-icons/cg'
import { FaMedal, FaTrophy } from 'react-icons/fa'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { API_HOST } from '@src/config'
import {
  getContestPrize,
  getContestScoreboard,
  keyContestPrize,
  keyContestScoreboard,
  useContestPrize,
  useContestScoreboard,
} from '@src/contest/queries'
import {
  UserWithSubmission,
  prizeDescription,
  prizes,
} from '@src/contest/types'
import { withCookies } from '@src/context/HttpClient'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { ButtonGroup } from '@src/ui/ButtonGroup'
import { IconButton } from '@src/ui/IconButton'
import { Link } from '@src/ui/Link'
import { Td as TD, Th as TH, Table } from '@src/ui/Table'
import { Tooltip } from '@src/ui/Tooltip'
import { sum } from '@src/utils/sum'
import { ONE_SECOND } from '@src/utils/time'

const Th = (props: ComponentProps<'th'>) => <TH textAlign="center" {...props} />
const Td = ({ className, ...props }: ComponentProps<'td'>) => (
  <TD
    className={clsx('text-center !py-2 leading-normal', className)}
    {...props}
  />
)

const fontSize: Record<number, string> = {
  1: 'text-4xl',
  2: 'text-3xl',
  3: 'text-2xl',
  4: 'text-xl',
  5: 'text-lg',
}

const getTotalScore = (user: UserWithSubmission) =>
  sum(user.submissions.map((submission) => submission.score))

export default function ContestHistory() {
  const router = useRouter()
  const id = Number(router.query.id)
  const { data: scoreboard } = useContestScoreboard(id)
  const { data: scoreboardPrize } = useContestPrize(id)
  const users = useMemo(() => {
    const scored = scoreboard!.users.map((user) => ({
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

  return (
    <PageContainer>
      <Head>
        <title>Contest History #{scoreboard!.id} | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={<FaTrophy />} lineClamp>
          {scoreboard!.name}
        </Title>
        <ButtonGroup isAttached>
          <IconButton
            variant="outline"
            aria-label="less-detail"
            onClick={onClose}
            isActive={!isOpen}
            icon={<CgDetailsLess />}
          />
          <IconButton
            variant="outline"
            aria-label="more-detail"
            onClick={onOpen}
            isActive={isOpen}
            icon={<CgDetailsMore />}
          />
        </ButtonGroup>
      </TitleLayout>
      <div className="overflow-x-auto">
        <Table variant={isOpen ? 'simple' : 'unstyled'}>
          <thead>
            <tr className="whitespace-nowrap">
              <Th>#</Th>
              <Th>ชื่อ</Th>
              <Th>คะแนนรวม</Th>
              {isOpen &&
                scoreboard!.problems.map((problem, index) => (
                  <Th key={problem.id}>
                    <Tooltip label={problem.name} shouldWrapChildren>
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
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={clsx(
                  'transition-all ',
                  isOpen ? 'text-md' : fontSize[user.rank]
                )}
              >
                <Td>{user.rank}</Td>
                <Td className={clsx(!isOpen && 'line-clamp-1')}>
                  <NextLink href={`/profile/${user.id}`}>
                    <Link className="line-clamp-3" variant="hidden">
                      {user.showName}
                    </Link>
                  </NextLink>
                </Td>
                <Td>{getTotalScore(user)}</Td>
                {isOpen &&
                  scoreboard!.problems.map((problem) => {
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
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <TitleLayout>
        <Title icon={<FaMedal />}>รางวัล</Title>
      </TitleLayout>
      <div className="overflow-auto">
        <Table>
          <thead>
            <tr className="whitespace-nowrap">
              <Th />
              {scoreboard!.problems.map((problem) => (
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
            </tr>
          </thead>
          <tbody>
            {prizes.map((prize) => {
              return (
                <tr key={prize}>
                  <Td className="text-left whitespace-nowrap">
                    <Tooltip
                      shouldWrapChildren
                      label={prizeDescription[prize].description}
                    >
                      {prizeDescription[prize].emoji}{' '}
                      {prizeDescription[prize].name}
                    </Tooltip>
                  </Td>
                  {scoreboard!.problems.map((problem) => {
                    const submissions = scoreboardPrize![prize].filter(
                      (submission) => problem.id === submission.problem.id
                    )
                    return (
                      <Td key={problem.id}>
                        <div className="flex flex-col gap-2">
                          {submissions.length === 0 ? (
                            <div>-</div>
                          ) : (
                            submissions.map((submission) => (
                              <NextLink
                                href={`/profile/${submission.user.id}`}
                                key={submission.id}
                              >
                                <Link
                                  className="max-w-[250px] line-clamp-1"
                                  variant="hidden"
                                >
                                  {submission.user.showName}
                                </Link>
                              </NextLink>
                            ))
                          )}
                        </div>
                      </Td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    </PageContainer>
  )
}

export const getServerSideProps = withCookies(async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  const scoreboard = getContestScoreboard(id)
  const contestPrize = getContestPrize(id)
  return {
    props: {
      fallback: {
        [keyContestScoreboard(id)]: await scoreboard,
        [keyContestPrize(id)]: await contestPrize,
      },
    },
  }
})
