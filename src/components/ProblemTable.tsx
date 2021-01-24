import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import {
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
import { SubmitButton } from './SubmitButton'
import { SubmitModal } from './SubmitModal'
import { ProblemDto } from '@src/utils/api/Problem'

const problems: ProblemDto[] = [
  { id: 3, name: 'Frog Frog Frog', timeLimit: 1, memory: 64 },
  { id: 2, name: 'ชนแก้วว', timeLimit: 1, memory: 128 },
  { id: 1, name: 'สลับราคา', timeLimit: 1, memory: 256 },
]

const initialProblem: ProblemDto = {
  id: 0,
  name: '',
  timeLimit: 0,
  memory: 0,
}

export function ProblemTable() {
  const [modalProblem, setModalProblem] = useState<ProblemDto>(initialProblem)
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Table variant="simple">
        <TableCaption>รายการโจทย์</TableCaption>
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>ชื่อ</Th>
            <Th>ส่ง</Th>
          </Tr>
        </Thead>
        <Tbody>
          {problems.map((problem) => (
            <ProblemRow
              problem={problem}
              key={problem.id}
              onOpen={onOpen}
              setModalProblem={setModalProblem}
            />
          ))}
        </Tbody>
      </Table>
      <SubmitModal problem={modalProblem} isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export interface ProblemRowProps {
  problem: ProblemDto
  onOpen: () => void
  setModalProblem: Dispatch<SetStateAction<ProblemDto>>
}

export function ProblemRow(props: ProblemRowProps) {
  const { problem, onOpen, setModalProblem } = props
  const onModalOpen = useCallback(() => {
    onOpen()
    setModalProblem(problem)
  }, [])

  return (
    <Tr key={problem.id}>
      <Td>{problem.id}</Td>
      <Td>
        <Link color="orange.400" href="#">
          {problem.name}
          <br />({problem.timeLimit} วินาที {problem.memory} MB)
        </Link>
      </Td>
      <Td>
        <SubmitButton onClick={onModalOpen} />
      </Td>
    </Tr>
  )
}
