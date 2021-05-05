import {
  Dispatch,
  memo,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
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

import {
  SubmissionWithProblem,
  useAllSubmissions,
  useSubmissionRow,
  useSubmissions,
} from '@src/utils/api/Submission'
import { CodeModal, ErrorModal } from './Code'
import { useAuth } from '@src/utils/api/AuthProvider'
import {
  isGraded,
  isGrading,
  useStatusColor,
} from '@src/utils/hooks/useStatusColor'
import { ONE_SECOND, toThDate } from '@src/utils/hooks/useTimer'
import { useOnScreen } from '@src/utils/hooks/useOnScreen'
import { API_HOST } from '@src/utils/config'

export const SubmissionTable = () => {
  const {
    data: submissionsList,
    setSize,
    size,
    isValidating,
  } = useSubmissions()
  useEffect(
    () => () => {
      setSize(1)
    },
    []
  )
  const submissions = useMemo(
    () => submissionsList?.flatMap((submissions) => submissions),
    [submissionsList]
  )
  const hasMore =
    isValidating || (submissionsList && submissionsList.length === size)
  const loadMore = () => {
    setSize((size) => size + 1)
  }

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

export const AllSubmissionTable = () => {
  const {
    data: submissionsList,
    setSize,
    size,
    isValidating,
  } = useAllSubmissions()
  useEffect(
    () => () => {
      setSize(1)
    },
    []
  )
  const submissions = useMemo(
    () => submissionsList?.flatMap((submissions) => submissions),
    [submissionsList]
  )
  const hasMore =
    isValidating || (submissionsList && submissionsList.length === size)
  const loadMore = () => {
    setSize((size) => size + 1)
  }

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
    if (isIntersecting) {
      if (hasMore) {
        loadMore?.()
      }
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
      <Td>{submission.user.showName}</Td>
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
