import { Button, IconButton } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { Input } from '@chakra-ui/input'
import { Box, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/layout'
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

import { Title } from '@src/components/Title'
import { getServerSideCookies } from '@src/utils/api'
import { getUserData } from '@src/utils/api/AuthProvider'
import {
  Contest,
  ContestMode,
  CreateContest,
  GradingMode,
  useContest,
  useContests,
} from '@src/utils/api/Contest'
import { ProblemWithSubmission, useProblems } from '@src/utils/api/Problem'
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { memo, useState } from 'react'
import { FaEye, FaEyeSlash, FaPlusCircle, FaTools } from 'react-icons/fa'
import NextLink from 'next/link'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useForm } from 'react-hook-form'
import { useToastError } from '@src/utils/hooks/useError'
import { Spinner } from '@chakra-ui/spinner'
import { RenderLater } from '@src/components/RenderLater'
import { mutate } from 'swr'
import Head from 'next/head'

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
      <Flex dir="row" justify="space-between" align="center">
        <Title icon={FaTools}>ระบบ GOTO</Title>
        <Text>
          <NextLink href="/admin/problem">
            <Button>โจทย์</Button>
          </NextLink>
        </Text>
      </Flex>
      <Stack spacing={4}>
        <HStack>
          <CreateContestModalButton setContestId={setContest} />
          <SelectContestModalButton setContestId={setContest} />
        </HStack>
        {contest && (
          <>
            <Heading as="h3" fontSize="3xl">
              {contest.name}
            </Heading>
            <ContestTable contest={contest} />
          </>
        )}
      </Stack>
    </PageContainer>
  )
}

interface CreateContestModalButtonProps {
  setContestId: (contestId: number) => void
}

function CreateContestModalButton(props: CreateContestModalButtonProps) {
  const { setContestId } = props
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())

  const { register, handleSubmit } = useForm()
  const http = useHttp()
  const { onError } = useToastError()
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
      onClose()
    } catch (e) {
      onError(e)
    }
  }
  return (
    <>
      <Button
        colorScheme="green"
        leftIcon={<FaPlusCircle />}
        size="lg"
        onClick={onOpen}
      >
        สร้างการแข่งขัน
      </Button>
      <Modal onClose={onClose} isOpen={isOpen} size="sm">
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
                    ref={register}
                    isRequired
                    name="name"
                    placeholder="การแข่งขัน"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>การเรท</FormLabel>
                  <Select ref={register} name="mode">
                    <option value="unrated">Unrated</option>
                    <option value="rated">Rated</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>โหมด</FormLabel>
                  <Select ref={register} name="gradingMode">
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

function ContestProblemRow(props: ContestProblemRowProps) {
  const { problem, isOpen: initialValue, contestId } = props
  const [isOpen, setOpen] = useState(initialValue)
  const http = useHttp()
  const { onError } = useToastError()

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
      <Td>{problem.name}</Td>
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

interface SelectContestModalButtonProps {
  setContestId: (id: number) => void
}

function SelectContestModalButton(props: SelectContestModalButtonProps) {
  const { setContestId } = props
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { data: contests } = useContests()
  return (
    <>
      <Button size="lg" colorScheme="blue" onClick={onOpen}>
        เลือกการแข่งขัน
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
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
                    onClose()
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
