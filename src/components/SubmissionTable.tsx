import { Dispatch, memo, SetStateAction, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Link,
  Spinner,
  Table,
  Tbody,
  Td,
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
import { isGraded, useStatusColor } from '@src/utils/hooks/useStatusColor'
import { toThDate } from '@src/utils/date'

export function SubmissionTable() {
  const { data: submissions } = useSubmissions()
  return submissions ? (
    <SubmissionTableBase submissions={submissions} />
  ) : (
    <Flex justify="center" py={16}>
      <Spinner size="xl" />
    </Flex>
  )
}

export function AllSubmissionTable() {
  const { data: submissions } = useAllSubmissions()
  return submissions ? (
    <SubmissionTableBase submissions={submissions} />
  ) : (
    <Flex justify="center" py={16}>
      <Spinner size="xl" />
    </Flex>
  )
}

interface SubmissionTableBaseProps {
  submissions: SubmissionWithProblem[]
}

export function SubmissionTableBase(props: SubmissionTableBaseProps) {
  const { submissions } = props
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [submissionId, setSubmissionId] = useState<number>(0)

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
    const { submissions, onOpen, setSubmissionId } = props
    return (
      <>
        {submissions.map((submission) => (
          <SubmissionRow
            submission={submission}
            key={submission.id}
            onOpen={onOpen}
            setSubmissionId={setSubmissionId}
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
  const { submission, onOpen, setSubmissionId } = props
  const onCodeModalOpen = () => {
    onOpen()
    setSubmissionId(submission.id)
  }

  const {
    isOpen: isErrorModalOpen,
    onOpen: onErrorModalOpen,
    onClose: onErrorModalClose,
  } = useDisclosure()

  const { user, isAdmin } = useAuth()
  const bg = useStatusColor(submission.status, true)

  return (
    <Tr bg={bg}>
      {user?.id === submission.user.id || isAdmin ? (
        <Td>
          <Button variant="ghost" onClick={onCodeModalOpen} px={1}>
            {submission.id}
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
        ) : isGraded(submission.status) ? (
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
