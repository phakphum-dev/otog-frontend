import { Dispatch, SetStateAction, useCallback, useState } from 'react'
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
import { SubmissionDto } from '@src/utils/api/Submission'
import { CodeModal } from './CodeModal'

const submissions: SubmissionDto[] = [
  {
    id: 3,
    problem: { id: 1, name: 'สลับราคา', timeLimit: 1, memory: 256 },
    user: { showName: 'TerZ' },
    timeUsed: 1,
    result: 'PPPT',
    score: 75,
    code: '#include <studio.h>',
    language: 'cpp',
  },
  {
    id: 2,
    problem: { id: 2, name: 'ชนแก้วว', timeLimit: 1, memory: 128 },
    user: { showName: 'Cher' },
    timeUsed: 0.0,
    result: 'PP',
    score: 100,
    code: 'int main()',

    language: 'c',
  },
  {
    id: 1,
    problem: { id: 3, name: 'Frog Frog Frog', timeLimit: 1, memory: 64 },
    user: { showName: 'Anos' },
    timeUsed: 0.1,
    result: '--',
    score: 0,
    code: 'if (true) { printf("a"); }',
    language: 'cpp',
  },
]

const initialSubmission: SubmissionDto = {
  id: 0,
  problem: { id: 0, name: '', timeLimit: 0, memory: 0 },
  user: { showName: '' },
  timeUsed: 0,
  result: '',
  score: 0,
  code: '',
  language: 'c',
}

export function SubmissionTable() {
  const [modalSubmission, setModalSubmission] = useState<SubmissionDto>(
    initialSubmission
  )
  const { isOpen, onOpen, onClose } = useDisclosure()

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
            <Th isNumeric>เวลารวม</Th>
            {/* <Th>คะแนน</Th> */}
          </Tr>
        </Thead>
        <Tbody>
          {submissions.map((submission) => (
            <SubmissionRow
              submission={submission}
              key={submission.id}
              onOpen={onOpen}
              setModalSubmission={setModalSubmission}
            />
          ))}
        </Tbody>
      </Table>
      <CodeModal
        submission={modalSubmission}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
}

export interface SubmissionRowProps {
  submission: SubmissionDto
  onOpen: () => void
  setModalSubmission: Dispatch<SetStateAction<SubmissionDto>>
}

export const SubmissionRow = (props: SubmissionRowProps) => {
  const { submission, onOpen, setModalSubmission } = props

  const onModalOpen = useCallback(() => {
    onOpen()
    setModalSubmission(submission)
  }, [])

  return (
    <Tr key={submission.id}>
      <Td>
        <Button variant="ghost" onClick={onModalOpen}>
          {submission.id}
        </Button>
      </Td>
      <Td>{submission.user.showName}</Td>
      <Td>
        <Link href="#">{submission.problem.name}</Link>
      </Td>
      <Td>{submission.result}</Td>
      <Td isNumeric>{submission.timeUsed}</Td>
      {/* <Td>{submission.score}</Td> */}
    </Tr>
  )
}
