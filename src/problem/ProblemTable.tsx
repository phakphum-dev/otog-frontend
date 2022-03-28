import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { memo, useEffect, useMemo, useState } from 'react'

import { CodeModal } from '../components/Code'
import { RenderLater } from '../components/RenderLater'
import { SubmitButton } from '../components/submit/SubmitButton'
import { SubmitModal } from '../components/submit/SubmitModal'

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
  Th,
  Thead,
  Tr,
  UseDisclosureReturn,
  useDisclosure,
} from '@chakra-ui/react'

import { API_HOST } from '@src/config'
import { ONE_SECOND } from '@src/contest/useTimer'
import { useAuth } from '@src/context/AuthContext'
import { useHttp } from '@src/context/HttpContext'
import { useErrorToast } from '@src/hooks/useError'
import {
  Problem,
  ProblemWithSubmission,
  usePassedUsers,
  useProblems,
} from '@src/problem/useProblem'
import { Submission } from '@src/submission/useSubmission'
import { useStatusColor } from '@src/theme/useStatusColor'

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
    return problems?.filter(filter).map((problem) => ({
      ...problem,
      submission: problem.submission?.id ? problem.submission : null,
    }))
  }, [problems, filter])

  const router = useRouter()
  const onSubmitSuccess = () => {
    router.push('/submission')
  }

  const { isAdmin } = useAuth()

  return filteredProblems ? (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th px={7} w={22}>
              #
            </Th>
            <Th>ชื่อ</Th>
            {isAdmin && (
              <Th w={22} textAlign="center">
                สถานะ
              </Th>
            )}
            <Th px={7} w={22} textAlign="center">
              ผ่าน
            </Th>
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
      <Spinner size="xl" color="gray.300" />
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
  const { isAdmin } = useAuth()

  const bg = useStatusColor(problem.submission)
  const http = useHttp()
  const { onError } = useErrorToast()

  const [show, setShow] = useState(problem.show)
  useEffect(() => {
    setShow(problem.show)
  }, [problem.show])
  const onToggle = async () => {
    setShow((show) => !show)
    try {
      const { show: newValue } = await http.patch<Problem>(
        `problem/${problem.id}`,
        {
          show: !show,
        }
      )
      setShow(newValue)
    } catch (e: any) {
      onError(e)
      setShow(show)
    }
  }

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
        <Link
          isExternal
          href={`${API_HOST}problem/doc/${problem.id}`}
          variant={show ? 'default' : 'close'}
        >
          {problem.name}
          <br />({problem.timeLimit / ONE_SECOND} วินาที {problem.memoryLimit}{' '}
          MB)
        </Link>
      </Td>
      {isAdmin && (
        <Td w={22} textAlign="center">
          <Link variant={show ? 'hidden' : 'close'} onClick={onToggle}>
            {show ? 'เปิด' : 'ซ่อน'}
          </Link>
        </Td>
      )}
      <Td w={22} textAlign="center">
        {problem.passedCount &&
        (isAdmin || problem.submission?.status === 'accept') ? (
          <Button variant="ghost" px={1} onClick={onPassedModalOpen}>
            {problem.passedCount}
          </Button>
        ) : (
          problem.passedCount
        )}
      </Td>
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
        <ModalHeader>ผู้ที่ผ่านข้อที่ {modalPassed}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            {users ? (
              users.map((user) => (
                <NextLink href={`/profile/${user.id}`} key={user.id}>
                  <Link variant="hidden" maxW={300}>
                    {user.showName}
                  </Link>
                </NextLink>
              ))
            ) : (
              <Flex justify="center">
                <Spinner />
              </Flex>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
