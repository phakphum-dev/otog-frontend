import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren, memo, useEffect, useMemo, useState } from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'

import { CodeModal } from '../components/Code'
import { RenderLater } from '../components/RenderLater'
import { SubmitButton } from '../submit/SubmitButton'
import { SubmitModal } from '../submit/SubmitModal'
import { usePassedUsers, useProblems } from './useProblem'

import {
  Box,
  Button,
  Flex,
  HStack,
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
  TableColumnHeaderProps,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UseDisclosureReturn,
  useDisclosure,
} from '@chakra-ui/react'

import { toggleProblem } from '@src/admin/queries/problem'
import { API_HOST } from '@src/config'
import { useAuth } from '@src/context/AuthContext'
import { useMutation } from '@src/hooks/useMutation'
import { ProblemWithSubmission } from '@src/problem/types'
import { Submission } from '@src/submission/types'
import { useStatusColor } from '@src/theme/useStatusColor'
import { ONE_SECOND } from '@src/utils/time'

export type FilterFunction = (problem: ProblemWithSubmission) => boolean
export interface ProblemTableProps {
  filter: FilterFunction
}

export type SortingFunction = (
  problem1: ProblemWithSubmission,
  problem2: ProblemWithSubmission
) => number

export type SortingOrder = 'desc' | 'asc'

export const ProblemTable = (props: ProblemTableProps) => {
  const { filter } = props

  const [modalProblem, setModalProblem] = useState<ProblemWithSubmission>()
  const [modalSubmission, setModalSubmission] = useState<Submission>()
  const [modalPassed, setModalPassed] = useState<number>()

  const submitModal = useDisclosure()
  const codeModal = useDisclosure()
  const passedModal = useDisclosure()

  const { data: problems } = useProblems()

  const sortingProps = useSortedTable('id', 'desc')
  const { sortFuncName, sortOrder } = sortingProps

  const sortedProblems = useMemo(() => {
    if (problems === undefined) return undefined
    const filteredProblems = problems.filter(filter).map((problem) => ({
      ...problem,
      submission: problem.submission?.id ? problem.submission : null,
    }))
    filteredProblems.sort(sortingFunctions[sortFuncName])
    if (sortOrder === 'desc') {
      filteredProblems.reverse()
    }
    return filteredProblems
  }, [problems, filter, sortFuncName, sortOrder])

  const router = useRouter()
  const onSubmitSuccess = () => {
    router.push('/submission')
  }

  const { isAdmin } = useAuth()

  return sortedProblems ? (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <SortTh px={7} w={22} sortBy="id" {...sortingProps}>
              #
            </SortTh>
            <Th sortBy="name" {...sortingProps}>
              ชื่อ
            </Th>
            {isAdmin && (
              <SortTh w={22} centered sortBy="status" {...sortingProps}>
                สถานะ
              </SortTh>
            )}
            <SortTh px={7} w={22} centered sortBy="passed" {...sortingProps}>
              ผ่าน
            </SortTh>
            <SortTh w={22} centered sortBy="sent" {...sortingProps}>
              ส่ง
            </SortTh>
          </Tr>
        </Thead>
        <Tbody>
          <ProblemsRows
            problems={sortedProblems}
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
// default is ascending
const sortingFunctions: Record<string, SortingFunction> = {
  id: (p1, p2) => p1.id - p2.id,
  status: (p1, p2) => {
    if (p1.show === p2.show) {
      return p1.id - p2.id
    }
    return Number(p1.show) - Number(p2.show)
  },
  passed: (p1, p2) => p1.passedCount - p2.passedCount,
  sent: (p1, p2) => {
    const val1 = getSubmissionValue(p1.submission)
    const val2 = getSubmissionValue(p2.submission)
    if (val1 === val2) {
      return p1.id - p2.id
    }
    return val1 - val2
  },
}

function getSubmissionValue(submission: Submission | null) {
  if (submission === null) {
    return 0
  }
  if (submission.status === 'accept') {
    return 3
  }
  if (submission.status === 'reject') {
    return 2
  }
  return 1
}
const useSortedTable = (
  initialSortName: string,
  initialOrder: SortingOrder
) => {
  const [sortFuncName, setSortFuncName] = useState(initialSortName)
  const [sortOrder, setSortOrder] = useState<SortingOrder>(initialOrder)
  const setSortFunction = (sortName: string, defaultOrder?: SortingOrder) => {
    if (sortFuncName === sortName) {
      if (sortOrder === 'desc') {
        setSortOrder('asc')
      } else {
        setSortOrder('desc')
      }
    } else if (defaultOrder) {
      setSortOrder(defaultOrder)
    }
    setSortFuncName(sortName)
  }
  return { sortFuncName, sortOrder, setSortFunction }
}

type TableHeadProps = PropsWithChildren<
  TableColumnHeaderProps &
    ReturnType<typeof useSortedTable> & {
      sortBy: string
      defaultOrder?: SortingOrder
      centered?: boolean
    }
>
export const SortTh = (props: TableHeadProps) => {
  const {
    setSortFunction,
    sortFuncName,
    sortOrder,
    sortBy,
    defaultOrder = 'desc',
    centered = false,
    children,
    ...rest
  } = props
  return (
    <Th {...rest}>
      <Link
        variant="head"
        onClick={() => setSortFunction(sortBy, defaultOrder)}
      >
        <HStack justify={centered ? 'center' : undefined}>
          <Text>{children}</Text>
          {sortFuncName === sortBy &&
            (sortOrder === 'desc' ? <FaArrowDown /> : <FaArrowUp />)}
        </HStack>
      </Link>
    </Th>
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

  const [show, setShow] = useState(problem.show)
  useEffect(() => {
    setShow(problem.show)
  }, [problem.show])

  const toggleProblemMutation = useMutation(toggleProblem)
  const onToggle = async () => {
    setShow((show) => !show)
    try {
      const { show: newValue } = await toggleProblemMutation(problem.id, !show)
      setShow(newValue)
    } catch {
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
