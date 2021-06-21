import { Button, IconButton } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { Input } from '@chakra-ui/input'
import { Box, Flex, Link, Spacer, Stack, Text } from '@chakra-ui/layout'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal'
import { Select } from '@chakra-ui/select'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import { DatePicker } from '@src/components/DatePick'
import { PageContainer } from '@src/components/PageContainer'

import { Title, TitleLayout } from '@src/components/Title'
import { API_HOST, getServerSideCookies } from '@src/api'
import { getUserData } from '@src/api/AuthProvider'
import {
  Contest,
  ContestMode,
  CreateContest,
  GradingMode,
  useContest,
  useContests,
} from '@src/hooks/useContest'
import { ProblemWithSubmission, useProblems } from '@src/hooks/useProblem'
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { memo, PropsWithChildren, useEffect, useState } from 'react'
import {
  FaEye,
  FaEyeSlash,
  FaPencilAlt,
  FaPlusCircle,
  FaTools,
  FaTrophy,
} from 'react-icons/fa'
import NextLink from 'next/link'
import { useHttp } from '@src/api/HttpProvider'
import { useForm } from 'react-hook-form'
import { useErrorToast } from '@src/hooks/useError'
import { Spinner } from '@chakra-ui/spinner'
import { RenderLater } from '@src/components/RenderLater'
import { mutate } from 'swr'
import Head from 'next/head'
import { HStack } from '@chakra-ui/react'
import { useConfirmModal } from '@src/components/ConfirmModal'

export default function AdminContestPage() {
  const [contestId, setContestId] = useState<number>()
  const { data: contest } = useContest(contestId)
  const setContest = (id: number) => {
    setContestId(id)
  }
  return (
    <PageContainer dense>
      <Head>
        <title>Admin Contest | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTools}>ระบบ GOTO</Title>
        <Text>
          <NextLink href="/admin/problem" passHref>
            <Button as="a">โจทย์</Button>
          </NextLink>
        </Text>
      </TitleLayout>
      <Stack spacing={4}>
        <Flex>
          <HStack>
            <SelectContestModalButton setContestId={setContest}>
              {contest?.name ?? 'เลือกการแข่งขัน'}
            </SelectContestModalButton>
            {contestId && <EditContestModalButton contest={contest} />}
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
  contest: Contest | undefined
}

const EditContestModalButton = (props: EditContestModalButtonProps) => {
  const { contest } = props
  const editModal = useDisclosure()
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())

  const { register, handleSubmit, reset } = useForm()
  useEffect(() => {
    if (contest) {
      reset(contest)
      setStartDate(new Date(contest.timeStart))
      setEndDate(new Date(contest.timeEnd))
    }
  }, [contest])

  const http = useHttp()
  const { onError } = useErrorToast()
  const onSubmit = async (value: {
    name: string
    gradingMode: GradingMode
    mode: ContestMode
  }) => {
    const body = {
      ...value,
      timeStart: startDate.toISOString(),
      timeEnd: endDate.toISOString(),
    }
    try {
      await http.put<Contest>(`contest/${contest?.id}`, body)
      mutate('contest')
      editModal.onClose()
    } catch (e) {
      onError(e)
    }
  }

  const { onConfirm } = useConfirmModal()
  const onDelete = () => {
    onConfirm({
      title: `ยืนยันลบการแข่งขัน`,
      subtitle: `คุณต้องการที่จะลบการแข่งขัน ${contest?.name} ใช่หรือไม่ ?`,
      submitText: 'ยืนยัน',
      cancleText: 'ยกเลิก',
      onSubmit: async () => {
        try {
          await http.del(`contest/${contest?.id}`)
          mutate('contest')
          editModal.onClose()
        } catch (e) {
          onError(e)
        }
      },
    })
  }

  return (
    <>
      <IconButton
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

  const { register, handleSubmit } = useForm()
  const http = useHttp()
  const { onError } = useErrorToast()
  const onSubmit = async (value: {
    name: string
    gradingMode: GradingMode
    mode: ContestMode
  }) => {
    const body = {
      ...value,
      timeStart: startDate.toISOString(),
      timeEnd: endDate.toISOString(),
    }
    try {
      const { id } = await http.post<Contest, CreateContest>('contest', body)
      setContestId(id)
      mutate('contest')
      createModal.onClose()
    } catch (e) {
      onError(e)
    }
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

const ContestTable = memo((props: ContestTableProps) => {
  const { contest } = props
  const { data: problems } = useProblems()
  const openProblemIds = contest.problems.map((problem) => problem.id)
  return problems ? (
    <Box overflowX="auto">
      <Table>
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>ชื่อ</Th>
            <Th>แก้ไข</Th>
          </Tr>
        </Thead>
        <Tbody>
          {problems.slice(0, 100).map((problem) => (
            <ContestProblemRow
              isOpen={openProblemIds.includes(problem.id)}
              contestId={contest.id}
              problem={problem}
              key={problem.id}
            />
          ))}
          {problems.slice(100).map((problem, index) => (
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
})

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
  const http = useHttp()
  const { onError } = useErrorToast()

  const onClick = async () => {
    setOpen((isOpen) => !isOpen)
    try {
      const { show } = await http.patch<{ show: boolean }>(
        `contest/${contestId}`,
        {
          problemId: problem.id,
          show: !isOpen,
        }
      )
      setOpen(show)
    } catch (e) {
      onError(e)
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
