import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { memo, useEffect, useMemo, useState } from 'react'

import { CodeModal } from '../components/Code'
import { SubmitButton } from '../submission/submit/SubmitButton'
import { SubmitModal } from '../submission/submit/SubmitModal'
import { usePassedUsers, useProblems } from './queries'

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  UseDisclosureReturn,
  useDisclosure,
} from '@chakra-ui/react'

import { toggleProblem } from '@src/admin/queries/problem'
import { SortTh, useSortedTable } from '@src/components/SortableTable'
import { problemSortFuncs } from '@src/components/SortableTable/utils'
import { API_HOST } from '@src/config'
import { useAuth } from '@src/context/AuthContext'
import { useMutation } from '@src/hooks/useMutation'
import { ProblemWithSubmission } from '@src/problem/types'
import { Submission } from '@src/submission/types'
import { useStatusColor } from '@src/theme/useStatusColor'
import { Button } from '@src/ui/Button'
import { Link } from '@src/ui/Link'
import { ONE_SECOND } from '@src/utils/time'

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

  const sortingProps = useSortedTable('id', 'desc')
  const { sortFuncName, sortOrder } = sortingProps

  const sortedProblems = useMemo(() => {
    if (problems === undefined) return undefined
    const filteredProblems = problems.filter(filter).map((problem) => ({
      ...problem,
      submission: problem.submission?.id ? problem.submission : null,
    }))
    filteredProblems.sort(problemSortFuncs[sortFuncName])
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
    <div className="overflow-x-auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <SortTh px={7} w={22} sortBy="id" {...sortingProps}>
              #
            </SortTh>
            <Th>ชื่อ</Th>
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
    </div>
  ) : (
    <div className="flex justify-center py-16">
      <Spinner size="xl" color="gray.300" />
    </div>
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
        {problems.map((problem) => (
          <ProblemRow key={problem.id} problem={problem} {...rest} />
        ))}
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
          <div className="flex flex-col gap-1">
            {users ? (
              users.map((user) => (
                <NextLink href={`/profile/${user.id}`} key={user.id}>
                  <Link className="max-w-[300px]" variant="hidden">
                    {user.showName}
                  </Link>
                </NextLink>
              ))
            ) : (
              <div className="flex justify-center">
                <Spinner />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
