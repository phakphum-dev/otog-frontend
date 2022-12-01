import { GetServerSideProps } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import { parseCookies } from 'nookies'
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

import { IconButton } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { Input } from '@chakra-ui/input'
import { Box, Flex, Spacer, Stack } from '@chakra-ui/layout'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal'
import { HStack } from '@chakra-ui/react'
import { Select } from '@chakra-ui/select'
import { Spinner } from '@chakra-ui/spinner'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'

import {
  createContest,
  deleteContest,
  toggleContestProblem,
  updateContest,
} from '@src/admin/queries/contest'
import { DatePicker } from '@src/components/DatePick'
import { RenderLater } from '@src/components/RenderLater'
import { SortTh, useSortedTable } from '@src/components/SortableTable'
import { problemSortFuncs } from '@src/components/SortableTable/utils'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { API_HOST } from '@src/config'
import { useContest, useContests } from '@src/contest/queries'
import { Contest, ContestMode, GradingMode } from '@src/contest/types'
import { getUserData } from '@src/context/AuthContext'
import { useConfirmModal } from '@src/context/ConfirmContext'
import { getServerSideCookies } from '@src/context/HttpClient'
import { useMutation } from '@src/hooks/useMutation'
import { useProblems } from '@src/problem/queries'
import { ProblemWithSubmission } from '@src/problem/types'
import { Button } from '@src/ui/Button'
import { Link } from '@src/ui/Link'

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
        <Title icon={FaTools}>ระบบ GOTO</Title>
        <HStack>
          <NextLink href="/admin/contest" passHref>
            <Button as="a">แข่งขัน</Button>
          </NextLink>
          <NextLink href="/admin/problem" passHref>
            <Button as="a">โจทย์</Button>
          </NextLink>
          <NextLink href="/admin/user" passHref>
            <Button as="a">ผู้ใช้งาน</Button>
          </NextLink>
        </HStack>
      </TitleLayout>
      <Stack spacing={4}>
        <Flex>
          <HStack>
            <SelectContestModalButton setContestId={setContest}>
              {contest?.name ?? 'เลือกการแข่งขัน'}
            </SelectContestModalButton>
            {contestId && contest && (
              <EditContestModalButton
                contest={contest}
                setContestId={setContestId}
              />
            )}
          </HStack>
          <Spacer />
          <CreateContestModalButton setContestId={setContest} />
        </Flex>
        {contest && <ContestTable contest={contest} />}
      </Stack>
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
      reset(contest)
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
    } catch {}
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
              <Stack>
                <FormControl>
                  <FormLabel>ชื่อการแข่งขัน</FormLabel>
                  <Input
                    isRequired
                    {...register('name')}
                    placeholder="การแข่งขัน"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>การเรท</FormLabel>
                  <Select {...register('mode')}>
                    <option value="unrated">Unrated</option>
                    <option value="rated">Rated</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>โหมด</FormLabel>
                  <Select {...register('gradingMode')}>
                    <option value="classic">Classic</option>
                    <option value="acm">ACM</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>เวลาเริ่ม</FormLabel>
                  <DatePicker
                    selectedDate={startDate}
                    onChange={(date: Date) => {
                      setStartDate(date)
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>เวลาจบ</FormLabel>
                  <DatePicker
                    selectedDate={endDate}
                    onChange={(date: Date) => {
                      setEndDate(date)
                    }}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Flex w="100%">
                <Button colorScheme="red" variant="ghost" onClick={onDelete}>
                  ลบ
                </Button>
                <Spacer />
                <Button colorScheme="green" type="submit">
                  บันทึก
                </Button>
              </Flex>
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
              <Stack>
                <FormControl>
                  <FormLabel>ชื่อการแข่งขัน</FormLabel>
                  <Input
                    {...register('name')}
                    isRequired
                    placeholder="การแข่งขัน"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>การเรท</FormLabel>
                  <Select {...register('mode')}>
                    <option value="unrated">Unrated</option>
                    <option value="rated">Rated</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>โหมด</FormLabel>
                  <Select {...register('gradingMode')}>
                    <option value="classic">Classic</option>
                    <option value="acm">ACM</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>เวลาเริ่ม</FormLabel>
                  <DatePicker
                    selectedDate={startDate}
                    onChange={(date: Date) => {
                      setStartDate(date)
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>เวลาจบ</FormLabel>
                  <DatePicker
                    selectedDate={endDate}
                    onChange={(date: Date) => {
                      setEndDate(date)
                    }}
                  />
                </FormControl>
              </Stack>
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
    <Box overflowX="auto">
      <Table>
        <Thead>
          <Tr>
            <SortTh sortBy="id" {...sortingProps}>
              #
            </SortTh>
            <Th>ชื่อ</Th>
            <SortTh sortBy="show" {...sortingProps}>
              แก้ไข
            </SortTh>
          </Tr>
        </Thead>
        <Tbody>
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
        </Tbody>
      </Table>
    </Box>
  ) : (
    <Flex justify="center" py={16}>
      <Spinner size="xl" />
    </Flex>
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
    <Tr>
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
    </Tr>
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
            <Stack>
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
            </Stack>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { accessToken = null } = parseCookies(context)
  const userData = getUserData(accessToken)
  if (userData?.role === 'admin') {
    return getServerSideCookies(context)
  }
  return {
    notFound: true,
  }
}
