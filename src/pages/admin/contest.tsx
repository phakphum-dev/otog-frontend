import Head from 'next/head'
import NextLink from 'next/link'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  FaEye,
  FaEyeSlash,
  FaPencilAlt,
  FaPlusCircle,
  FaTools,
  FaTrophy,
} from 'react-icons/fa'
import { mutate } from 'swr'

import {
  createContest,
  deleteContest,
  toggleContestProblem,
  updateContest,
} from '@src/admin/queries/contest'
import { withSession } from '@src/api/withSession'
import { DatePicker } from '@src/components/DatePick'
import { RenderLater } from '@src/components/RenderLater'
import { SortTh, useSortedTable } from '@src/components/SortableTable'
import { problemSortFuncs } from '@src/components/SortableTable/utils'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { API_HOST } from '@src/config'
import { useContest, useContests } from '@src/contest/queries'
import { Contest, ContestMode, GradingMode } from '@src/contest/types'
import { useConfirmModal } from '@src/context/ConfirmContext'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { useMutation } from '@src/hooks/useMutation'
import { useProblems } from '@src/problem/queries'
import { ProblemWithSubmission } from '@src/problem/types'
import { Button } from '@src/ui/Button'
import { IconButton } from '@src/ui/IconButton'
import { FormLabel, Input, Select } from '@src/ui/Input'
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
import { Table, Td, Th } from '@src/ui/Table'
import { onErrorToast } from '@src/hooks/useErrorToast'

export default function AdminContestPage() {
  const [contestId, setContestId] = useState<number>()
  const { data: contest } = useContest(contestId)
  const setContest = (id: number) => {
    setContestId(id)
  }
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Admin Contest | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={<FaTools />}>ระบบ GOTO</Title>
        <div className="flex gap-2">
          <NextLink passHref legacyBehavior href="/admin/contest">
            <Button>แข่งขัน</Button>
          </NextLink>
          <NextLink passHref legacyBehavior href="/admin/problem">
            <Button>โจทย์</Button>
          </NextLink>
          <NextLink passHref legacyBehavior href="/admin/user">
            <Button>ผู้ใช้งาน</Button>
          </NextLink>
        </div>
      </TitleLayout>
      <div className="flex flex-col gap-4">
        <div className="flex">
          <div className="flex gap-2">
            <SelectContestModalButton setContestId={setContest}>
              {contest?.name ?? 'เลือกการแข่งขัน'}
            </SelectContestModalButton>
            {!!contestId && contest && (
              <EditContestModalButton
                contest={contest}
                setContestId={setContestId}
              />
            )}
          </div>
          <div className="flex-1" />
          <CreateContestModalButton setContestId={setContest} />
        </div>
        {contest && <ContestTable contest={contest} />}
      </div>
    </PageContainer>
  )
}

interface EditContestModalButtonProps {
  contest: Contest
  setContestId: (contestId: number) => void
}

type UpdataContestData = {
  name: string
  gradingMode: GradingMode
  mode: ContestMode
}

const EditContestModalButton = (props: EditContestModalButtonProps) => {
  const { contest, setContestId } = props
  const editModal = useDisclosure()
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())

  const { register, handleSubmit, reset } = useForm<UpdataContestData>()
  useEffect(() => {
    if (contest) {
      const { mode, name, gradingMode } = contest
      reset({ mode, name, gradingMode })
      setStartDate(new Date(contest.timeStart))
      setEndDate(new Date(contest.timeEnd))
    }
  }, [contest, reset])

  const updateContestMutation = useMutation(updateContest)
  const onSubmit = async (value: UpdataContestData) => {
    const body = {
      ...value,
      timeStart: startDate.toISOString(),
      timeEnd: endDate.toISOString(),
    }
    try {
      await updateContestMutation(contest.id, body)
      await mutate('contest')
      await mutate(`contest/${contest.id}`)
      editModal.onClose()
    } catch (e) {
      onErrorToast(e)
    }
  }

  const confirm = useConfirmModal()
  const deleteContestMutation = useMutation(deleteContest)
  const onDelete = () => {
    confirm({
      title: `ยืนยันลบการแข่งขัน`,
      subtitle: `คุณต้องการที่จะลบการแข่งขัน ${contest.name} ใช่หรือไม่ ?`,
      submitText: 'ยืนยัน',
      cancleText: 'ยกเลิก',
      onSubmit: async () => {
        try {
          await deleteContestMutation(contest.id)
          mutate('contest')
          editModal.onClose()
          setContestId(0)
        } catch {}
      },
    })
  }

  return (
    <>
      <IconButton
        variant="outline"
        colorScheme="orange"
        aria-label="edit-contest"
        icon={<FaPencilAlt />}
        onClick={editModal.onOpen}
      />
      <Modal {...editModal}>
        <ModalOverlay />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>แก้ไขการแข่งขัน</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div>
                  <FormLabel>ชื่อการแข่งขัน</FormLabel>
                  <Input
                    required
                    {...register('name')}
                    placeholder="การแข่งขัน"
                  />
                </div>
                <div>
                  <FormLabel>การเรท</FormLabel>
                  <Select {...register('mode')}>
                    <option value="unrated">Unrated</option>
                    <option value="rated">Rated</option>
                  </Select>
                </div>
                <div>
                  <FormLabel>โหมด</FormLabel>
                  <Select {...register('gradingMode')}>
                    <option value="classic">Classic</option>
                    <option value="acm">ACM</option>
                  </Select>
                </div>
                <div>
                  <FormLabel>เวลาเริ่ม</FormLabel>
                  <DatePicker
                    selectedDate={startDate}
                    onChange={(date: Date) => {
                      setStartDate(date)
                    }}
                  />
                </div>
                <div>
                  <FormLabel>เวลาจบ</FormLabel>
                  <DatePicker
                    selectedDate={endDate}
                    onChange={(date: Date) => {
                      setEndDate(date)
                    }}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex w-full">
                <Button colorScheme="red" variant="ghost" onClick={onDelete}>
                  ลบ
                </Button>
                <div className="flex-1" />
                <Button colorScheme="green" type="submit">
                  บันทึก
                </Button>
              </div>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

interface CreateContestModalButtonProps {
  setContestId: (contestId: number) => void
}

const CreateContestModalButton = (props: CreateContestModalButtonProps) => {
  const { setContestId } = props
  const createModal = useDisclosure()
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())

  const { register, handleSubmit } = useForm<UpdataContestData>()
  const createContestMutation = useMutation(createContest)
  const onSubmit = async (value: UpdataContestData) => {
    const body = {
      ...value,
      timeStart: startDate.toISOString(),
      timeEnd: endDate.toISOString(),
    }
    try {
      const { id } = await createContestMutation(body)
      setContestId(id)
      mutate('contest')
      createModal.onClose()
    } catch {}
  }
  return (
    <>
      <Button
        colorScheme="green"
        leftIcon={<FaPlusCircle />}
        onClick={createModal.onOpen}
      >
        สร้างการแข่งขัน
      </Button>
      <Modal {...createModal}>
        <ModalOverlay />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>สร้างการแข่งขัน</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div>
                  <FormLabel>ชื่อการแข่งขัน</FormLabel>
                  <Input
                    {...register('name')}
                    required
                    placeholder="การแข่งขัน"
                  />
                </div>
                <div>
                  <FormLabel>การเรท</FormLabel>
                  <Select {...register('mode')}>
                    <option value="unrated">Unrated</option>
                    <option value="rated">Rated</option>
                  </Select>
                </div>
                <div>
                  <FormLabel>โหมด</FormLabel>
                  <Select {...register('gradingMode')}>
                    <option value="classic">Classic</option>
                    <option value="acm">ACM</option>
                  </Select>
                </div>
                <div>
                  <FormLabel>เวลาเริ่ม</FormLabel>
                  <DatePicker
                    selectedDate={startDate}
                    onChange={(date: Date) => {
                      setStartDate(date)
                    }}
                  />
                </div>
                <div>
                  <FormLabel>เวลาจบ</FormLabel>
                  <DatePicker
                    selectedDate={endDate}
                    onChange={(date: Date) => {
                      setEndDate(date)
                    }}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" type="submit">
                สร้าง
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

interface ContestTableProps {
  contest: Contest
}

const ContestTable = function ContestTable(props: ContestTableProps) {
  const { contest } = props
  const { data: problems } = useProblems()
  const openProblemIds = contest.problems.map((problem) => problem.id)
  const sortingProps = useSortedTable('id', 'desc')
  const { sortOrder, sortFuncName } = sortingProps
  const sortedProblems = useMemo(() => {
    if (problems === undefined) return undefined
    if (sortFuncName === 'show') {
      problems.sort((p1, p2) => {
        const val1 = Number(openProblemIds.includes(p1.id))
        const val2 = Number(openProblemIds.includes(p2.id))
        if (val1 === val2) {
          return p1.id - p2.id
        }
        return val1 - val2
      })
    } else {
      problems.sort(problemSortFuncs[sortFuncName])
    }
    if (sortOrder === 'desc') {
      problems.reverse()
    }
    return [...problems]
  }, [problems, sortFuncName, sortOrder, openProblemIds])
  return sortedProblems ? (
    <div className="overflow-x-auto">
      <Table>
        <thead>
          <tr>
            <SortTh sortBy="id" {...sortingProps}>
              #
            </SortTh>
            <Th>ชื่อ</Th>
            <SortTh sortBy="show" {...sortingProps}>
              แก้ไข
            </SortTh>
          </tr>
        </thead>
        <tbody>
          {sortedProblems.slice(0, 100).map((problem) => (
            <ContestProblemRow
              isOpen={openProblemIds.includes(problem.id)}
              contestId={contest.id}
              problem={problem}
              key={problem.id}
            />
          ))}
          {sortedProblems.slice(100).map((problem, index) => (
            <RenderLater key={problem.id} delay={~~(index / 100)}>
              <ContestProblemRow
                isOpen={openProblemIds.includes(problem.id)}
                contestId={contest.id}
                problem={problem}
              />
            </RenderLater>
          ))}
        </tbody>
      </Table>
    </div>
  ) : (
    <div className="flex justify-center py-16">
      <Spinner size="xl" />
    </div>
  )
}

interface ContestProblemRowProps {
  contestId: number
  problem: ProblemWithSubmission
  isOpen: boolean
}

const ContestProblemRow = (props: ContestProblemRowProps) => {
  const { problem, isOpen: initialValue, contestId } = props
  const [isOpen, setOpen] = useState(initialValue)
  useEffect(() => {
    setOpen(initialValue)
  }, [initialValue])

  const toggleContestProblemMutation = useMutation(toggleContestProblem)
  const onClick = async () => {
    setOpen((isOpen) => !isOpen)
    try {
      const { show } = await toggleContestProblemMutation(
        contestId,
        problem.id,
        !isOpen
      )
      setOpen(show)
      mutate(`contest/${contestId}`)
    } catch {
      setOpen(isOpen)
    }
  }

  return (
    <tr>
      <Td>{problem.id}</Td>
      <Td>
        <Link
          isExternal
          variant="hidden"
          href={`${API_HOST}problem/doc/${problem.id}`}
        >
          {problem.name}
        </Link>
      </Td>
      <Td>
        <IconButton
          colorScheme={isOpen ? 'orange' : 'gray'}
          icon={isOpen ? <FaEye /> : <FaEyeSlash />}
          aria-label="open-or-close"
          onClick={onClick}
        />
      </Td>
    </tr>
  )
}

type SelectContestModalButtonProps = PropsWithChildren<{
  setContestId: (id: number) => void
}>

const SelectContestModalButton = (props: SelectContestModalButtonProps) => {
  const { setContestId, children } = props
  const selectModal = useDisclosure()
  const { data: contests } = useContests()
  return (
    <>
      <Button
        colorScheme="orange"
        onClick={selectModal.onOpen}
        leftIcon={<FaTrophy />}
      >
        {children}
      </Button>
      <Modal {...selectModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>เลือกการแข่งขัน</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="flex flex-col gap-2">
              {contests?.map((contest) => (
                <Button
                  key={contest.id}
                  onClick={() => {
                    setContestId(contest.id)
                    selectModal.onClose()
                  }}
                  variant="ghost"
                  colorScheme="orange"
                >
                  {contest.name}
                </Button>
              ))}
            </div>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  )
}

export const getServerSideProps = withSession(async (session) => {
  const userData = session?.user
  if (userData?.role === 'admin') {
    return { props: {} }
  }
  return {
    notFound: true,
  }
})
