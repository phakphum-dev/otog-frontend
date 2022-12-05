import NextLink from 'next/link'
import { Dispatch, SetStateAction, memo, useEffect, useState } from 'react'

import { CodeModal, ErrorModal } from '../components/Code'
import { SubmissionWithProblem } from './types'

import {
  Flex,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from '@chakra-ui/react'

import { API_HOST } from '@src/config'
import { useAuth } from '@src/context/AuthContext'
import { useOnScreen } from '@src/hooks/useOnScreen'
import {
  useAllSubmissions,
  useInfiniteSubmissionTable,
  useSubmissionRow,
  useSubmissions,
} from '@src/submission/queries'
import { LatestSubmission } from '@src/submission/submit/LatestSubmission'
import { isGraded, isGrading, useStatusColor } from '@src/theme/useStatusColor'
import { Button } from '@src/ui/Button'
import { Link } from '@src/ui/Link'
import { ONE_SECOND, toThDate } from '@src/utils/time'

export const SubmissionTable = () => {
  const submissionsResponse = useSubmissions()
  const { mutate } = submissionsResponse
  const infiniteSubmissionTableProps = useInfiniteSubmissionTable(
    submissionsResponse
  )
  return (
    <>
      <HStack mb={4}>
        <LatestSubmission onSuccess={mutate} />
      </HStack>
      <InfiniteSubmissionTable {...infiniteSubmissionTableProps} />
    </>
  )
}

export interface SubmissionTableProps {
  userId: number
}

export const ProfileSubmissionTable = ({ userId }: SubmissionTableProps) => {
  const submissionsResponse = useSubmissions(userId)
  const infiniteSubmissionTableProps = useInfiniteSubmissionTable(
    submissionsResponse
  )
  return <InfiniteSubmissionTable {...infiniteSubmissionTableProps} />
}

export const AllSubmissionTable = () => {
  const submissionsResponse = useAllSubmissions()
  const infiniteSubmissionTableProps = useInfiniteSubmissionTable(
    submissionsResponse
  )
  return <InfiniteSubmissionTable {...infiniteSubmissionTableProps} />
}

interface SubmissionTableBaseProps {
  submissionsList: Array<SubmissionWithProblem[]> | undefined
  loadMore?: () => void
  hasMore?: boolean
}

export const InfiniteSubmissionTable = (props: SubmissionTableBaseProps) => {
  const { submissionsList, loadMore, hasMore = false } = props
  const codeDisclosure = useDisclosure()
  const [submissionId, setSubmissionId] = useState<number>(0)
  const { ref, isIntersecting } = useOnScreen()
  useEffect(() => {
    if (isIntersecting && hasMore) {
      loadMore?.()
    }
  }, [isIntersecting, loadMore, hasMore])

  if (!submissionsList) {
    return (
      <Flex justify="center" py={16}>
        <Spinner size="xl" />
      </Flex>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th px={7}>#</Th>
            <Th>ชื่อ</Th>
            <Th>ข้อ</Th>
            <Th>ผลตรวจ</Th>
            <Th>เวลารวม</Th>
            {/* <Th>คะแนน</Th> */}
          </Tr>
        </Thead>
        <Tbody>
          {submissionsList.map(
            (submissions) =>
              submissions.length > 0 && (
                <SubmissionRows
                  key={submissions[0].id}
                  submissions={submissions}
                  onOpen={codeDisclosure.onOpen}
                  setSubmissionId={setSubmissionId}
                />
              )
          )}
        </Tbody>
      </Table>
      {hasMore && (
        <Flex justify="center" py={6}>
          <Spinner size="lg" ref={ref} />
        </Flex>
      )}
      <CodeModal submissionId={submissionId} {...codeDisclosure} />
    </div>
  )
}

interface ModalSubmissionProps {
  onOpen: () => void
  setSubmissionId: Dispatch<SetStateAction<number>>
}

interface SubmissionRowsProps extends ModalSubmissionProps {
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

interface SubmissionRowProps extends ModalSubmissionProps {
  submission: SubmissionWithProblem
}

const SubmissionRow = (props: SubmissionRowProps) => {
  const { submission: initialData, onOpen, setSubmissionId } = props
  const { data: submission } = useSubmissionRow(initialData)

  const onCodeModalOpen = () => {
    onOpen()
    setSubmissionId(submission?.id ?? 0)
  }

  const errorDisclosure = useDisclosure()

  const { user, isAdmin } = useAuth()
  const bg = useStatusColor(submission, true)

  if (!submission) {
    return null
  }
  return (
    <Tr bg={bg}>
      <Td lineHeight="40px">
        {user?.id === submission?.user.id || isAdmin ? (
          <Button variant="ghost" onClick={onCodeModalOpen} px={1}>
            {submission?.id}
          </Button>
        ) : (
          <Tooltip
            hasArrow
            placement="top"
            label={toThDate(submission.creationDate)}
          >
            <div className="px-1">{submission.id}</div>
          </Tooltip>
        )}
      </Td>
      <Td maxW={300}>
        <NextLink href={`/profile/${submission.user.id}`}>
          <Link className="line-clamp-3" variant="hidden">
            {submission.user.showName}
            {isAdmin && ` (${submission.user.username})`}
          </Link>
        </NextLink>
      </Td>
      <Td>
        <Link
          isExternal
          href={`${API_HOST}problem/doc/${submission.problem.id}`}
          variant="hidden"
        >
          {submission.problem.name}
        </Link>
      </Td>
      <Td maxW={345} wordBreak="break-all">
        {submission.errmsg && (isAdmin || user?.id === submission.user.id) ? (
          <>
            <Button px={1} variant="ghost" onClick={errorDisclosure.onOpen}>
              {submission.result}
            </Button>
            <ErrorModal {...errorDisclosure} submission={submission} />
          </>
        ) : isGrading(submission) ? (
          <HStack>
            <Spinner size="xs" />
            <Text>{submission.result}</Text>
          </HStack>
        ) : isGraded(submission) && !submission.errmsg ? (
          <code>{submission.result}</code>
        ) : (
          submission.result
        )}
      </Td>
      <Td whiteSpace="nowrap">{submission.timeUsed / ONE_SECOND} s</Td>
      {/* <Td>{submission.score}</Td> */}
    </Tr>
  )
}
