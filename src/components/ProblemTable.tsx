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
  useDisclosure,
} from '@chakra-ui/react'
import { SubmitButton } from './SubmitButton'
import { SubmitModal } from './SubmitModal'
import { ProblemDto, useProblems } from '@src/utils/api/Problem'
import { useRouter } from 'next/router'
import { API_HOST } from '@src/utils/api'
import { useStatusColor } from '@src/utils/hooks/useStatusColor'
import { CodeModal } from './CodeModal'
import { SubmissionDto } from '@src/utils/api/Submission'

export function ProblemTable() {
  const [modalProblem, setModalProblem] = useState<ProblemDto>()
  const [modalSubmission, setModalSubmission] = useState<SubmissionDto>()
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

  const router = useRouter()
  const onSubmitSuccess = () => {
    router.push('/submission')
  }

  return problems ? (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th textAlign="center">#</Th>
            <Th>ชื่อ</Th>
            <Th>ส่ง</Th>
          </Tr>
        </Thead>
        <Tbody>
          <ProblemsRows
            problems={problems}
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
  setModalProblem: Dispatch<SetStateAction<ProblemDto | undefined>>
  onCodeOpen: () => void
  setModalSubmission: Dispatch<SetStateAction<SubmissionDto | undefined>>
}

interface ProblemRowsProps extends ModalProblemProps {
  problems: ProblemDto[]
}

const ProblemsRows = memo(
  (props: ProblemRowsProps) => {
    const { problems, ...rest } = props
    return (
      <>
        {problems.map((problem) => (
          <ProblemRow key={problem.id} problem={problem} {...rest} />
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
    onCodeOpen()
    // TODO: add submission
    setModalSubmission(undefined)
  }
  // TODO: add submission status
  const bg = useStatusColor()

  return (
    <Tr bg={bg}>
      {/* TODO: add latest submission*/}
      {false ? (
        <Td>
          <Button onClick={onCodeModalOpen} variant="ghost" px={1}>
            {problem.id}
          </Button>
        </Td>
      ) : (
        <Td textAlign="center">{problem.id}</Td>
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
