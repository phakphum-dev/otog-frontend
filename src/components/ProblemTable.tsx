import { memo, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  UseDisclosureReturn,
} from '@chakra-ui/react'
import { SubmitButton } from './SubmitButton'
import { SubmitModal } from './SubmitModal'
import {
  ProblemWithSubmission,
  usePassedUsers,
  useProblems,
} from '@src/utils/api/Problem'
import { useRouter } from 'next/router'
import { API_HOST } from '@src/utils/api'
import { useStatusColor } from '@src/utils/hooks/useStatusColor'
import { CodeModal } from './Code'
import { Submission } from '@src/utils/api/Submission'
import { RenderLater } from './RenderLater'
import { ONE_SECOND } from '@src/utils/hooks/useTimer'

export type FilterFunction = (problem: ProblemWithSubmission) => boolean
export interface ProblemTableProps {
  filter: FilterFunction
}

export const ProblemTable = (props: ProblemTableProps) => {
  const { filter } = props

  const [modalProblem, setModalProblem] = useState<ProblemWithSubmission>()
  const [modalSubmission, setModalSubmission] = useState<Submission>()
  const [modalPassed, setModalPassed] = useState<number>()

  const submitModal = useDisclosure()
  const codeModal = useDisclosure()
  const passedModal = useDisclosure()

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
            <Th px={7} w={22}>
              #
            </Th>
            <Th>ชื่อ</Th>
            {/* <Th px={7} w={22} textAlign="center">
              ผ่าน
            </Th> */}
            <Th w={22} textAlign="center">
              ส่ง
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          <ProblemsRows
            problems={filteredProblems}
            onSubmitOpen={submitModal.onOpen}
            setModalProblem={setModalProblem}
            onCodeOpen={codeModal.onOpen}
            setModalSubmission={setModalSubmission}
            onPassedOpen={passedModal.onOpen}
            setModalPassed={setModalPassed}
          />
        </Tbody>
      </Table>
      {modalProblem && (
        <SubmitModal
          problem={modalProblem}
          onSuccess={onSubmitSuccess}
          submitted={!!modalProblem.submission}
          {...submitModal}
        />
      )}
      {modalSubmission && (
        <CodeModal {...codeModal} submissionId={modalSubmission.id} />
      )}
      {modalPassed && (
        <PassedModal {...passedModal} modalPassed={modalPassed} />
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
  setModalProblem: (problem: ProblemWithSubmission | undefined) => void
  onCodeOpen: () => void
  setModalSubmission: (submission: Submission | undefined) => void
  onPassedOpen: () => void
  setModalPassed: (problemId: number) => void
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

const ProblemRow = (props: ProblemRowProps) => {
  const {
    problem,
    onSubmitOpen,
    setModalProblem,
    onCodeOpen,
    setModalSubmission,
    onPassedOpen,
    setModalPassed,
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
  const onPassedModalOpen = () => {
    onPassedOpen()
    setModalPassed(problem.id)
  }
  const bg = useStatusColor(problem.submission)

  return (
    <Tr bg={bg}>
      <Td textAlign="center" w={22}>
        {problem.submission ? (
          <Button onClick={onCodeModalOpen} variant="ghost" px={1}>
            {problem.id}
          </Button>
        ) : (
          problem.id
        )}
      </Td>
      <Td>
        <Link isExternal href={`${API_HOST}problem/doc/${problem.id}`}>
          {problem.name}
          <br />({problem.timeLimit / ONE_SECOND} วินาที {problem.memoryLimit}{' '}
          MB)
        </Link>
      </Td>
      {/* <Td w={22} textAlign="center">
        {problem.submission?.status === 'accept' ? (
          <Button variant="ghost" px={1} onClick={onPassedModalOpen}>
            {problem?.passed ?? 0}
          </Button>
        ) : (
          problem?.passed ?? 0
        )}
      </Td> */}
      <Td w={22}>
        <SubmitButton onClick={onSubmitModalOpen} />
      </Td>
    </Tr>
  )
}

interface PassedModalProps extends UseDisclosureReturn {
  modalPassed: number
}

const PassedModal = (props: PassedModalProps) => {
  const { isOpen, onClose, modalPassed } = props
  const { data: users } = usePassedUsers(modalPassed)
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ผู้ที่ผ่าน</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            {users?.map((user) => (
              <Text key={user.id}>{user.showName}</Text>
            ))}
          </Stack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
