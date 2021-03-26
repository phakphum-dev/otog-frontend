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
  Tr,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'

import { SubmissionDto, useSubmissions } from '@src/utils/api/Submission'
import { CodeModal, ErrorModal } from './CodeModal'
import { API_HOST } from '@src/utils/api'

interface SubmissionTableProps {
  isOnlyMe: boolean
}

export function SubmissionTable(props: SubmissionTableProps) {
  const { isOnlyMe } = props
  const { data: submissions } = useSubmissions(isOnlyMe)
  return submissions ? (
    <SubmissionTableBase submissions={submissions} />
  ) : (
    <Flex justify="center" py={16}>
      <Spinner size="xl" />
    </Flex>
  )
}

interface SubmissionTableBaseProps {
  submissions: SubmissionDto[]
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
            <Th>#</Th>
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
  submissions: SubmissionDto[]
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
  submission: SubmissionDto
}

const SubmissionRow = (props: SubmissionRowProps) => {
  const { submission, onOpen, setSubmissionId } = props
  const status = submission.result
    .split('')
    .filter((res) => res !== '[' && res !== ']')
    .every((res) => res === 'P')
    ? 'accept'
    : 'reject'

  const onCodeModalOpen = () => {
    onOpen()
    setSubmissionId(submission.id)
  }

  const {
    isOpen: isErrorModalOpen,
    onOpen: onErrorModalOpen,
    onClose: onErrorModalClose,
  } = useDisclosure()

  const acceptColor = useColorModeValue('green.50', 'green.900')

  return (
    <Tr key={submission.id} bg={status === 'accept' ? acceptColor : undefined}>
      <Td inNumeric>
        <Button variant="ghost" onClick={onCodeModalOpen} px={0}>
          {submission.id}
        </Button>
      </Td>
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
        {submission.isGrading ? (
          submission.result
        ) : submission.errmsg ? (
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
        ) : (
          <code>{submission.result}</code>
        )}
      </Td>
      <Td>{submission.timeUsed / 1000}</Td>
      {/* <Td>{submission.score}</Td> */}
    </Tr>
  )
}
