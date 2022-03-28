import NextLink from 'next/link'
import { Dispatch, SetStateAction, memo, useEffect, useState } from 'react'

import { CodeModal, ErrorModal } from '../components/Code'

import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
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

import { LatestSubmission } from '@src/components/submit/LatestSubmission'
import { API_HOST } from '@src/config'
import { ONE_SECOND, toThDate } from '@src/contest/useTimer'
import { useAuth } from '@src/context/AuthContext'
import { useOnScreen } from '@src/hooks/useOnScreen'
import {
  SubmissionWithProblem,
  useAllSubmissions,
  useSubmissionInfinite,
  useSubmissionRow,
  useSubmissions,
} from '@src/submission/useSubmission'
import { isGraded, isGrading, useStatusColor } from '@src/theme/useStatusColor'

export const SubmissionTable = () => {
  const submissionData = useSubmissions()
  const { mutate, submissions, loadMore, hasMore } = useSubmissionInfinite(
    submissionData
  )
  return (
    <>
      <HStack mb={4}>
        <LatestSubmission onSuccess={mutate} />
      </HStack>
      {submissions ? (
        <SubmissionTableBase
          submissions={submissions}
          loadMore={loadMore}
          hasMore={hasMore}
        />
      ) : (
        <Flex justify="center" py={16}>
          <Spinner size="xl" />
        </Flex>
      )}
    </>
  )
}

export const AllSubmissionTable = () => {
  const submissionData = useAllSubmissions()
  const { submissions, loadMore, hasMore } = useSubmissionInfinite(
    submissionData
  )

  return submissions ? (
    <SubmissionTableBase
      submissions={submissions}
      loadMore={loadMore}
      hasMore={hasMore}
    />
  ) : (
    <Flex justify="center" py={16}>
      <Spinner size="xl" />
    </Flex>
  )
}

interface SubmissionTableBaseProps {
  submissions: SubmissionWithProblem[]
  loadMore?: () => void
  hasMore?: boolean
}

export const SubmissionTableBase = (props: SubmissionTableBaseProps) => {
  const { submissions, loadMore, hasMore } = props
  const codeDisclosure = useDisclosure()
  const [submissionId, setSubmissionId] = useState<number>(0)
  const { ref, isIntersecting } = useOnScreen()
  useEffect(() => {
    if (isIntersecting && hasMore) {
      loadMore?.()
    }
  }, [isIntersecting])

  return (
    <Box overflowX="auto">
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
          <SubmissionRows
            submissions={submissions}
            onOpen={codeDisclosure.onOpen}
            setSubmissionId={setSubmissionId}
          />
        </Tbody>
      </Table>
      {hasMore && (
        <Flex justify="center" py={6}>
          <Spinner size="lg" ref={ref} />
        </Flex>
      )}
      <CodeModal submissionId={submissionId} {...codeDisclosure} />
    </Box>
  )
}

interface ModalSubmissionProps {
  onOpen: () => void
  setSubmissionId: Dispatch<SetStateAction<number>>
}

interface SubmissionRowsProps extends ModalSubmissionProps {
  submissions: SubmissionWithProblem[]
}

const SubmissionRows = memo(
  (props: SubmissionRowsProps) => {
    const { submissions, ...rest } = props
    return (
      <>
        {submissions.map((submission) => (
          <SubmissionRow
            submission={submission}
            key={submission.id}
            {...rest}
          />
        ))}
      </>
    )
  },
  (prevProps, nextProps) => prevProps.submissions === nextProps.submissions
)

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
            <Box px={1}>{submission.id}</Box>
          </Tooltip>
        )}
      </Td>
      <Td maxW={300}>
        <NextLink href={`/profile/${submission.user.id}`}>
          <Link variant="hidden">
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
      <Td>
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
