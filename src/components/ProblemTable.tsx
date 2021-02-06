import { Dispatch, memo, SetStateAction, useState } from 'react'
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
import { ProblemDto, useProblems } from '@src/utils/api/Problem'

const initialProblem: ProblemDto = {
  id: 0,
  name: '',
  timeLimit: 0,
  memory: 0,
  sname: '',
  score: 0,
  state: 0,
  recentShowTime: 0,
  case: '',
  rating: 0,
}

export function ProblemTable() {
  const [modalProblem, setModalProblem] = useState<ProblemDto>(initialProblem)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: problems } = useProblems()

  return (
    <>
      <Table variant="simple">
        <TableCaption>รายการโจทย์</TableCaption>
        <Thead>
          <Tr>
            <Th isNumeric>#</Th>
            <Th>ชื่อ</Th>
            <Th>ส่ง</Th>
          </Tr>
        </Thead>
        <Tbody>
          <ProblemsRows
            problems={problems}
            onOpen={onOpen}
            setModalProblem={setModalProblem}
          />
        </Tbody>
      </Table>
      <SubmitModal problem={modalProblem} isOpen={isOpen} onClose={onClose} />
    </>
  )
}

interface ModalProblemProps {
  onOpen: () => void
  setModalProblem: Dispatch<SetStateAction<ProblemDto>>
}

interface ProblemRowsProps extends ModalProblemProps {
  problems: ProblemDto[] | undefined
}

const ProblemsRows = memo(
  (props: ProblemRowsProps) => {
    const { problems, onOpen, setModalProblem } = props
    return (
      <>
        {problems?.map((problem) => (
          <ProblemRow
            key={problem.id}
            problem={problem}
            onOpen={onOpen}
            setModalProblem={setModalProblem}
          />
        ))}
      </>
    )
  },
  (prevProps, nextProps) => prevProps.problems === nextProps.problems
)

interface ProblemRowProps extends ModalProblemProps {
  problem: ProblemDto
}

function ProblemRow(props: ProblemRowProps) {
  const { problem, onOpen, setModalProblem } = props
  const onModalOpen = () => {
    onOpen()
    setModalProblem(problem)
  }

  return (
    <Tr key={problem.id}>
      <Td isNumeric>{problem.id}</Td>
      <Td>
        <Link color="otog" href="#">
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
