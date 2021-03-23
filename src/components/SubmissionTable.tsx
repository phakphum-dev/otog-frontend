import { Dispatch, memo, SetStateAction, useState } from 'react'
import {
  Button,
  Link,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react'

import { SubmissionDto, useSubmissions } from '@src/utils/api/Submission'
import { CodeModal, ErrorModal } from './CodeModal'
import { API_HOST } from '@src/utils/api'

export function SubmissionTable() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [submissionId, setSubmissionId] = useState<number>(0)

  const { data: submissions } = useSubmissions()

  return (
    <>
      <Table variant="simple">
        <TableCaption>ผลตรวจ</TableCaption>
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
    </>
  )
}

interface ModalSubmissionProps {
  onOpen: () => void
  setSubmissionId: Dispatch<SetStateAction<number>>
}

interface SubmissionRowsProps extends ModalSubmissionProps {
  submissions: SubmissionDto[] | undefined
}

const SubmissionRows = memo(
  (props: SubmissionRowsProps) => {
    const { submissions, onOpen, setSubmissionId } = props
    return (
      <>
        {submissions?.map((submission) => (
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

  const onCodeModalOpen = () => {
    onOpen()
    setSubmissionId(submission.id)
  }

  const {
    isOpen: isErrorModalOpen,
    onOpen: onErrorModalOpen,
    onClose: onErrorModalClose,
  } = useDisclosure()

  return (
    <Tr key={submission.id}>
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
