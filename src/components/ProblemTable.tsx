import { Dispatch, memo, SetStateAction, useMemo, useState } from 'react'
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
  useDisclosure,
} from '@chakra-ui/react'
import { SubmitButton } from './SubmitButton'
import { SubmitModal } from './SubmitModal'
import { ProblemWithSubmission, useProblems } from '@src/utils/api/Problem'
import { useRouter } from 'next/router'
import { API_HOST } from '@src/utils/api'
import { useStatusColor } from '@src/utils/hooks/useStatusColor'
import { CodeModal } from './CodeModal'
import { Submission } from '@src/utils/api/Submission'
import { RenderLater } from './RenderLater'

export type FilterFunction = (problem: ProblemWithSubmission) => boolean
export interface ProblemTableProps {
  filter: FilterFunction
}

export function ProblemTable(props: ProblemTableProps) {
  const { filter } = props
  const [modalProblem, setModalProblem] = useState<ProblemWithSubmission>()
  const [modalSubmission, setModalSubmission] = useState<Submission>()
  const {
    isOpen: isSubmitOpen,
    onOpen: onSubmitOpen,
    onClose: onSubmitClose,
  } = useDisclosure()
  const {
    isOpen: isCodeOpen,
    onOpen: onCodeOpen,
    onClose: onCodeClose,
  } = useDisclosure()
  const { data: problems } = useProblems()
  const filteredProblems = useMemo(() => {
    return problems?.filter(filter)
  }, [problems, filter])

  const router = useRouter()
  const onSubmitSuccess = () => {
    router.push('/submission')
  }

  return filteredProblems ? (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th px={7}>#</Th>
            <Th>ชื่อ</Th>
            <Th>ส่ง</Th>
          </Tr>
        </Thead>
        <Tbody>
          <ProblemsRows
            problems={filteredProblems}
            onSubmitOpen={onSubmitOpen}
            setModalProblem={setModalProblem}
            onCodeOpen={onCodeOpen}
            setModalSubmission={setModalSubmission}
          />
        </Tbody>
      </Table>
      {modalProblem && (
        <SubmitModal
          problem={modalProblem}
          isOpen={isSubmitOpen}
          onClose={onSubmitClose}
          onSuccess={onSubmitSuccess}
        />
      )}
      {modalSubmission && (
        <CodeModal
          isOpen={isCodeOpen}
          onClose={onCodeClose}
          submissionId={modalSubmission.id}
        />
      )}
    </Box>
  ) : (
    <Flex justify="center" py={16}>
      <Spinner size="xl" />
    </Flex>
  )
}

interface ModalProblemProps {
  onSubmitOpen: () => void
  setModalProblem: Dispatch<SetStateAction<ProblemWithSubmission | undefined>>
  onCodeOpen: () => void
  setModalSubmission: Dispatch<SetStateAction<Submission | undefined>>
}

interface ProblemRowsProps extends ModalProblemProps {
  problems: ProblemWithSubmission[]
}

const ProblemsRows = memo(
  (props: ProblemRowsProps) => {
    const { problems, ...rest } = props
    return (
      <>
        {problems.slice(0, 100).map((problem) => (
          <ProblemRow key={problem.id} problem={problem} {...rest} />
        ))}
        {problems.slice(100).map((problem, index) => (
          <RenderLater key={problem.id} delay={~~(index / 100)}>
            <ProblemRow problem={problem} {...rest} />
          </RenderLater>
        ))}
        {/* 
        {problems.map((problem) => (
          <ProblemRow key={problem.id} problem={problem} {...rest} />
        ))} */}
      </>
    )
  },
  (prevProps, nextProps) => prevProps.problems === nextProps.problems
)

interface ProblemRowProps extends ModalProblemProps {
  problem: ProblemWithSubmission
}

function ProblemRow(props: ProblemRowProps) {
  const {
    problem,
    onSubmitOpen,
    setModalProblem,
    onCodeOpen,
    setModalSubmission,
  } = props
  const onSubmitModalOpen = () => {
    onSubmitOpen()
    setModalProblem(problem)
  }
  const onCodeModalOpen = () => {
    if (problem.submission) {
      onCodeOpen()
      setModalSubmission(problem.submission)
    }
  }
  const bg = useStatusColor(problem.submission)

  return (
    <Tr bg={bg}>
      {problem.submission ? (
        <Td>
          <Button onClick={onCodeModalOpen} variant="ghost" px={1}>
            {problem.id}
          </Button>
        </Td>
      ) : (
        <Td>{problem.id}</Td>
      )}
      <Td>
        <Link
          color="otog"
          href={`${API_HOST}problem/doc/${problem.id}`}
          target="_blank"
        >
          {problem.name}
          <br />({problem.timeLimit / 1000} วินาที {problem.memoryLimit} MB)
        </Link>
      </Td>
      <Td>
        <SubmitButton onClick={onSubmitModalOpen} />
      </Td>
    </Tr>
  )
}
