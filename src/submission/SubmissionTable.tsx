import NextLink from 'next/link'
import { memo, useEffect } from 'react'

import { SubmissionWithProblem } from './types'

import { useUserData } from '@src/context/UserContext'
import { useOnScreen } from '@src/hooks/useOnScreen'
import {
  useAllSubmissions,
  useInfiniteSubmissionTable,
  useSubmissionRow,
  useSubmissions,
} from '@src/submission/queries'
import { LatestSubmission } from '@src/submission/submit/LatestSubmission'
import { isGraded, isGrading, getBgColor } from '@src/theme/useStatusColor'
import { Link } from '@src/ui/Link'
import { Spinner } from '@src/ui/Spinner'
import { Table, Td, Th } from '@src/ui/Table'
import { Tooltip } from '@src/ui/Tooltip'
import { ONE_SECOND, toThDate } from '@src/utils/time'
import clsx from 'clsx'

export const SubmissionTable = () => {
  const submissionsResponse = useSubmissions()
  const { mutate } = submissionsResponse
  const infiniteSubmissionTableProps =
    useInfiniteSubmissionTable(submissionsResponse)
  return (
    <>
      <div className="mb-4 flex gap-2">
        <LatestSubmission onSuccess={mutate} />
      </div>
      <InfiniteSubmissionTable {...infiniteSubmissionTableProps} />
    </>
  )
}

export interface SubmissionTableProps {
  userId: number
}

export const ProfileSubmissionTable = ({ userId }: SubmissionTableProps) => {
  const submissionsResponse = useSubmissions(userId)
  const infiniteSubmissionTableProps =
    useInfiniteSubmissionTable(submissionsResponse)
  return <InfiniteSubmissionTable {...infiniteSubmissionTableProps} />
}

export const AllSubmissionTable = () => {
  const submissionsResponse = useAllSubmissions()
  const infiniteSubmissionTableProps =
    useInfiniteSubmissionTable(submissionsResponse)
  return <InfiniteSubmissionTable {...infiniteSubmissionTableProps} />
}

interface SubmissionTableBaseProps {
  submissionsList: Array<SubmissionWithProblem[]> | undefined
  loadMore?: () => void
  hasMore?: boolean
}

export const InfiniteSubmissionTable = (props: SubmissionTableBaseProps) => {
  const { submissionsList, loadMore, hasMore = false } = props
  const { ref, isIntersecting } = useOnScreen()
  useEffect(() => {
    if (isIntersecting && hasMore) {
      loadMore?.()
    }
  }, [isIntersecting, loadMore, hasMore])

  if (!submissionsList) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="xl" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>ชื่อ</Th>
            <Th>ข้อ</Th>
            <Th>คะแนน</Th>
            <Th>เวลารวม</Th>
            {/* <Th>คะแนน</Th> */}
          </tr>
        </thead>
        <tbody>
          {submissionsList.map(
            (submissions) =>
              submissions.length > 0 && (
                <SubmissionRows
                  key={submissions[0].id}
                  submissions={submissions}
                />
              )
          )}
        </tbody>
      </Table>
      {hasMore && (
        <div className="flex justify-center py-6" ref={ref}>
          <Spinner size="lg" />
        </div>
      )}
    </div>
  )
}

interface SubmissionRowsProps {
  submissions: SubmissionWithProblem[]
}

const SubmissionRows = memo((props: SubmissionRowsProps) => {
  const { submissions, ...rest } = props
  return (
    <>
      {submissions.map((submission) => (
        <SubmissionRow submission={submission} key={submission.id} {...rest} />
      ))}
    </>
  )
})

interface SubmissionRowProps {
  submission: SubmissionWithProblem
}

const SubmissionRow = (props: SubmissionRowProps) => {
  const { submission: initialData } = props
  const { data: submission } = useSubmissionRow(initialData)

  const { user, isAdmin } = useUserData()
  const bg = getBgColor(submission)

  if (!submission) {
    return null
  }

  const accessible =
    submission.public || user?.id === submission?.user.id || isAdmin

  const SubmissionElement = (
    <tr className={clsx(accessible && bg, accessible && 'cursor-pointer')}>
      <Td className="h-16">
        <Tooltip placement="top" label={toThDate(submission.creationDate)}>
          <div className="px-1">{submission.id}</div>
        </Tooltip>
      </Td>
      <Td>
        <NextLink
          href={`/profile/${submission.user.id}`}
          passHref
          legacyBehavior
        >
          <Link className="line-clamp-3 w-36 break-all" variant="hidden">
            {submission.user.showName}
          </Link>
        </NextLink>
      </Td>
      <Td>
        <NextLink
          href={`/problem/${submission.problem.id}`}
          passHref
          legacyBehavior
        >
          <Link className="line-clamp-3 w-36 break-all" variant="hidden">
            {submission.problem.name}
          </Link>
        </NextLink>
      </Td>
      <Td>
        {isGrading(submission) ? (
          <div className="flex items-center gap-2">
            <Spinner size="xs" />
            <div>{submission.result}</div>
          </div>
        ) : isGraded(submission) && !submission.errmsg ? (
          submission.score
        ) : (
          submission.result
        )}
      </Td>
      <Td className="whitespace-nowrap">
        {submission.timeUsed / ONE_SECOND} s
      </Td>
      {/* <Td>{submission.score}</Td> */}
    </tr>
  )

  if (accessible) {
    return (
      <NextLink href={`/submission/${submission.id}`} passHref legacyBehavior>
        {SubmissionElement}
      </NextLink>
    )
  }
  return SubmissionElement
}

export function splitCases(result: string) {
  // if (result.includes('[') || result.includes('(')) {
  //   const bracketExp = /[[(].*?[\])]/g
  //   return [...result.matchAll(bracketExp)]
  // }
  const tokens: string[] = []
  let count = 0
  let str = ''
  for (const c of result) {
    if (c === ']' || c === ')') {
      tokens.push(str + c)
      count = 0
      str = ''
    } else if (count === 10) {
      tokens.push(str)
      count = 1
      str = c
    } else if (c === '[' || c === '(') {
      str += c
    } else {
      str += c
      count += 1
    }
  }
  if (str) {
    tokens.push(str)
  }
  return tokens
}
