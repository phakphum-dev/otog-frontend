import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { memo, useEffect, useMemo, useState } from 'react'

import { CodeModal } from '../components/Code'
import { SubmitButton } from '../submission/submit/SubmitButton'
import { SubmitModal } from '../submission/submit/SubmitModal'
import { usePassedUsers, useProblems } from './queries'

import { toggleProblem } from '@src/admin/queries/problem'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@src/components/Modal'
import { SortTh, useSortedTable } from '@src/components/SortableTable'
import { problemSortFuncs } from '@src/components/SortableTable/utils'
import { API_HOST } from '@src/config'
import { useAuth } from '@src/context/AuthContext'
import { UseDisclosureReturn, useDisclosure } from '@src/hooks/useDisclosure'
import { useMutation } from '@src/hooks/useMutation'
import { ProblemWithSubmission } from '@src/problem/types'
import { Submission } from '@src/submission/types'
import { useStatusColor } from '@src/theme/useStatusColor'
import { Button } from '@src/ui/Button'
import { Link } from '@src/ui/Link'
import { Spinner } from '@src/ui/Spinner'
import { Table, Td, Th } from '@src/ui/Table'
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
      <Table>
        <thead>
          <tr>
            <SortTh className="w-20" centered sortBy="id" {...sortingProps}>
              #
            </SortTh>
            <Th>ชื่อ</Th>
            {isAdmin && (
              <SortTh
                className="w-20"
                centered
                sortBy="status"
                {...sortingProps}
              >
                สถานะ
              </SortTh>
            )}
            <SortTh className="w-20" centered sortBy="passed" {...sortingProps}>
              ผ่าน
            </SortTh>
            <SortTh className="w-24" centered sortBy="sent" {...sortingProps}>
              ส่ง
            </SortTh>
          </tr>
        </thead>
        <tbody>
          <ProblemsRows
            problems={sortedProblems}
            onSubmitOpen={submitModal.onOpen}
            setModalProblem={setModalProblem}
            onCodeOpen={codeModal.onOpen}
            setModalSubmission={setModalSubmission}
            onPassedOpen={passedModal.onOpen}
            setModalPassed={setModalPassed}
          />
        </tbody>
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
      <Spinner size="xl" />
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
    <tr className={bg}>
      <Td className="text-center">
        {problem.submission ? (
          <Button onClick={onCodeModalOpen} variant="link">
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
          <p>{problem.name}</p>
          <p>
            ({problem.timeLimit / ONE_SECOND} วินาที {problem.memoryLimit} MB)
          </p>
        </Link>
      </Td>
      {isAdmin && (
        <Td className="text-center">
          <Link variant={show ? 'hidden' : 'close'} onClick={onToggle}>
            {show ? 'เปิด' : 'ซ่อน'}
          </Link>
        </Td>
      )}
      <Td className="text-center">
        {problem.passedCount &&
        (isAdmin || problem.submission?.status === 'accept') ? (
          <Button variant="link" onClick={onPassedModalOpen}>
            {problem.passedCount}
          </Button>
        ) : (
          problem.passedCount
        )}
      </Td>
      <Td className="text-center">
        <SubmitButton onClick={onSubmitModalOpen} />
      </Td>
    </tr>
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
          <div className="flex flex-col gap-2">
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
