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
  useSubmissions,
} from '@src/utils/api/Submission'
import { CodeModal, ErrorModal } from './CodeModal'
import { API_HOST } from '@src/utils/api'
import { useAuth } from '@src/utils/api/AuthProvider'
import {
  isGraded,
  isGrading,
  useStatusColor,
} from '@src/utils/hooks/useStatusColor'
import { toThDate } from '@src/utils/date'
import useSWR, { mutate } from 'swr'
import { useOnScreen } from '@src/utils/hooks/useOnScreen'

export function SubmissionTable() {
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

export function AllSubmissionTable() {
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

export function SubmissionTableBase(props: SubmissionTableBaseProps) {
  const { submissions, loadMore, hasMore } = props
  const { isOpen, onOpen, onClose } = useDisclosure()
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
            onOpen={onOpen}
            setSubmissionId={setSubmissionId}
          />
        </Tbody>
      </Table>
      {hasMore && (
        <Flex justify="center" py={6}>
          <Spinner size="lg" ref={ref} />
        </Flex>
      )}
      <CodeModal
        submissionId={submissionId}
        isOpen={isOpen}
        onClose={onClose}
      />
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
  const { data: submission } = useSWR<SubmissionWithProblem>(
    isGrading(initialData) ? `/submission/${initialData.id}` : null,
    {
      initialData,
      revalidateOnMount: true,
      onSuccess: (data, key) => {
        if (isGrading(data)) {
          setTimeout(() => mutate(key), 1000)
        }
      },
    }
  )

  const onCodeModalOpen = () => {
    onOpen()
    setSubmissionId(submission?.id ?? 0)
  }

  const {
    isOpen: isErrorModalOpen,
    onOpen: onErrorModalOpen,
    onClose: onErrorModalClose,
  } = useDisclosure()

  const { user, isAdmin } = useAuth()
  const bg = useStatusColor(submission, true)

  if (!submission) {
    return null
  }
  return (
    <Tr bg={bg}>
      {user?.id === submission?.user.id || isAdmin ? (
        <Td>
          <Button variant="ghost" onClick={onCodeModalOpen} px={1}>
            {submission?.id}
          </Button>
        </Td>
      ) : (
        <Td textAlign="center" lineHeight="40px">
          <Tooltip
            hasArrow
            placement="top"
            label={toThDate(submission.creationDate)}
          >
            <div>{submission.id}</div>
          </Tooltip>
        </Td>
      )}
      <Td>{submission.user.showName}</Td>
      <Td>
        <Link
          href={`${API_HOST}problem/doc/${submission.problem.id}`}
          target="_blank"
        >
          {submission.problem.name}
        </Link>
      </Td>
      <Td>
        {submission.errmsg ? (
          <>
            <Button px={1} variant="ghost" onClick={onErrorModalOpen}>
              {submission.result}
            </Button>
            <ErrorModal
              isOpen={isErrorModalOpen}
              onClose={onErrorModalClose}
              submission={submission}
            />
          </>
        ) : isGrading(submission) ? (
          <HStack>
            <Spinner size="xs" />
            <Text>{submission.result}</Text>
          </HStack>
        ) : isGraded(submission) ? (
          <code>{submission.result}</code>
        ) : (
          submission.result
        )}
      </Td>
      <Td>{submission.timeUsed / 1000}</Td>
      {/* <Td>{submission.score}</Td> */}
    </Tr>
  )
}
