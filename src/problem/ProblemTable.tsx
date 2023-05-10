import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { CodeModal } from '../components/Code'
import { SubmitModal } from '../submission/submit/SubmitModal'
import { usePassedUsers, useProblems } from './queries'

import { toggleProblem } from '@src/admin/queries/problem'
import { SortTh, useSortedTable } from '@src/components/SortableTable'
import { problemSortFuncs } from '@src/components/SortableTable/utils'
import { API_HOST } from '@src/config'
import { useUserData } from '@src/context/UserContext'
import {
  UseDisclosuredReturn,
  useDisclosure,
  useDisclosured,
} from '@src/hooks/useDisclosure'
import { useMutation } from '@src/hooks/useMutation'
import { ProblemWithSubmission } from '@src/problem/types'
import { Button } from '@src/ui/Button'
import { Link } from '@src/ui/Link'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@src/ui/Modal'
import { Spinner } from '@src/ui/Spinner'
import { Table, Td, Th, Tr } from '@src/ui/Table'
import { ONE_SECOND } from '@src/utils/time'
import { IconButton } from '@src/ui/IconButton'
import { FaCheckCircle, FaEye, FaEyeSlash, FaFileUpload } from 'react-icons/fa'
import clsx from 'clsx'
import { Filter, filters } from './filters'
import { EditIcon } from '@src/icons/EditIcon'

export type FilterFunction = (problem: ProblemWithSubmission) => boolean
export interface ProblemTableProps {
  filterName: Filter
}

export const ProblemTable = (props: ProblemTableProps) => {
  const { filterName } = props

  const { data: problems } = useProblems()

  const sortingProps = useSortedTable('id', 'desc')
  const { sortFuncName, sortOrder } = sortingProps

  const sortedProblems = useMemo(() => {
    if (problems === undefined) return undefined
    const filteredProblems = problems
      .filter(filters[filterName].filter)
      .map((problem) => ({
        ...problem,
        submission: problem.submission?.id ? problem.submission : null,
      }))
    filteredProblems.sort(problemSortFuncs[sortFuncName])
    if (sortOrder === 'desc') {
      filteredProblems.reverse()
    }
    return filteredProblems
  }, [problems, filterName, sortFuncName, sortOrder])

  return sortedProblems ? (
    <Table variant="rounded" className="shadow-md">
      <thead>
        <tr className="bg-gray-50 dark:bg-slate-800">
          <SortTh
            className="w-20 max-sm:hidden"
            centered
            sortBy="id"
            {...sortingProps}
          >
            #
          </SortTh>
          <Th className="max-sm:rounded-tl-lg max-sm:border-l">ชื่อ</Th>
          <SortTh
            className="w-20 max-sm:hidden"
            centered
            sortBy="passed"
            {...sortingProps}
          >
            ผ่าน
          </SortTh>
          <SortTh className="w-24" centered sortBy="sent" {...sortingProps}>
            ส่ง
          </SortTh>
        </tr>
      </thead>
      <tbody>
        {sortedProblems.map((problem) => (
          <ProblemRow key={problem.id} problem={problem} />
        ))}
      </tbody>
    </Table>
  ) : (
    <div className="flex justify-center py-16">
      <Spinner size="xl" />
    </div>
  )
}

interface ProblemRowProps {
  problem: ProblemWithSubmission
}

const ProblemRow = (props: ProblemRowProps) => {
  const { problem } = props
  const submitModal = useDisclosure()
  const codeModal = useDisclosured()
  const passedModal = useDisclosured()
  const { isAdmin } = useUserData()

  const [show, setShow] = useState(problem.show)
  useEffect(() => {
    setShow(problem.show)
  }, [problem.show])

  const toggleProblemMutation = useMutation(toggleProblem)
  const onToggle = async () => {
    setShow(!show)
    try {
      const { show: newValue } = await toggleProblemMutation(problem.id, !show)
      setShow(newValue)
    } catch {
      setShow(show)
    }
  }

  const router = useRouter()
  const onSubmitSuccess = () => {
    router.push('/submission')
  }
  const status = problem.submission?.status
  const submitted = !!problem.submission
  return (
    <>
      <SubmitModal
        problem={problem}
        onSuccess={onSubmitSuccess}
        submitted={submitted}
        {...submitModal}
      />
      {!!problem.submission && (
        <CodeModal {...codeModal} submissionId={problem.submission.id} />
      )}
      <PassedModal {...passedModal} problemId={problem.id} />
      <Tr className="group/row relative max-sm:[&>:nth-child(2)]:last:rounded-bl-lg">
        <Td className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 max-sm:hidden">
          {problem.submission ? (
            <Button onClick={codeModal.onOpen} variant="link">
              {problem.id}
            </Button>
          ) : (
            problem.id
          )}
        </Td>
        <Td className="max-sm:border-l">
          <Link
            isExternal
            href={`${API_HOST}problem/doc/${problem.id}`}
            className={clsx(!show && 'text-gray-500 hover:text-otog')}
          >
            <p className="font-semibold tracking-wide">{problem.name}</p>
            <p className="mt-0.5 text-sm">
              ({problem.timeLimit / ONE_SECOND} วินาที {problem.memoryLimit} MB)
            </p>
          </Link>
        </Td>
        <Td className="text-bold text-center text-sm font-semibold text-gray-600 dark:text-gray-400 max-sm:hidden">
          {problem.passedCount &&
          (isAdmin || problem.submission?.status === 'accept') ? (
            <Button variant="link" onClick={passedModal.onOpen}>
              {problem.passedCount}
            </Button>
          ) : (
            problem.passedCount
          )}
        </Td>
        <Td className="text-center">
          {status ? (
            <IconButton
              aria-label="Upload file"
              variant="outline"
              icon={status === 'accept' ? <FaCheckCircle /> : <FaFileUpload />}
              colorScheme={status === 'accept' ? 'otog-green' : 'otog-red'}
              onClick={submitModal.onOpen}
            />
          ) : (
            <IconButton
              aria-label="Upload file"
              variant="outline"
              icon={<FaFileUpload />}
              className="text-gray-600 dark:text-alpha-white-700"
              onClick={submitModal.onOpen}
            />
          )}
          {isAdmin && (
            <IconButton
              size="sm"
              rounded
              onClick={onToggle}
              variant="outline"
              className="invisible absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/row:visible"
              icon={show ? <FaEye /> : <FaEyeSlash />}
            />
          )}
          <IconButton
            as={NextLink}
            href={`/problem/${problem.id}`}
            size="sm"
            rounded
            className="invisible absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 group-hover/row:visible"
            icon={<EditIcon />}
          />
        </Td>
      </Tr>
    </>
  )
}

interface PassedModalProps extends UseDisclosuredReturn {
  problemId: number
}

const PassedModal = (props: PassedModalProps) => {
  const { isOpen, onClose, opened, problemId } = props
  const { data: users } = usePassedUsers(opened ? problemId : null)
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ผู้ที่ผ่านข้อที่ {problemId}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div className="flex flex-col gap-2">
            {users ? (
              users.map((user) => (
                <NextLink
                  href={`/profile/${user.id}`}
                  key={user.id}
                  passHref
                  legacyBehavior
                >
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
