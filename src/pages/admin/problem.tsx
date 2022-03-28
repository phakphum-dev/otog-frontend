import { GetServerSideProps } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import { parseCookies } from 'nookies'
import { FormEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  FaEye,
  FaEyeSlash,
  FaPencilAlt,
  FaPlusCircle,
  FaSync,
  FaTools,
  FaTrash,
} from 'react-icons/fa'
import { mutate } from 'swr'

import { Button, ButtonGroup, IconButton } from '@chakra-ui/button'
import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { Input } from '@chakra-ui/input'
import { Box, Flex, Link, Stack, Text } from '@chakra-ui/layout'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal'
import { HStack, Spacer, UseDisclosureReturn } from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/spinner'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'

import { FileInput } from '@src/components/FileInput'
import { RenderLater } from '@src/components/RenderLater'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { API_HOST } from '@src/config'
import { getUserData } from '@src/context/AuthContext'
import { useConfirmModal } from '@src/context/ConfirmContext'
import { getServerSideCookies } from '@src/context/HttpClient'
import { useHttp } from '@src/context/HttpContext'
import { useErrorToast } from '@src/hooks/useError'
import { useFileInput } from '@src/hooks/useFileInput'
import {
  Problem,
  ProblemWithSubmission,
  useProblems,
} from '@src/problem/useProblem'

export default function AdminProblemPage() {
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Admin Problem | OTOG</title>
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
        <Flex justify="flex-end">
          <CreateProblemModalButton />
        </Flex>
        <ProblemAdminTable />
      </Stack>
    </PageContainer>
  )
}

const CreateProblemModalButton = () => {
  const createModal = useDisclosure()

  const { resetFile: resetPdfInput, fileInputProps: pdfProps } = useFileInput()
  const { resetFile: resetZipInput, fileInputProps: zipProps } = useFileInput()

  const http = useHttp()
  const { onError } = useErrorToast()
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await http.post('problem', new FormData(e.currentTarget))
      mutate('problem')
      createModal.onClose()
      resetPdfInput()
      resetZipInput()
    } catch (e: any) {
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
        เพิ่มโจทย์
      </Button>
      <Modal {...createModal} size="sm">
        <ModalOverlay />
        <form onSubmit={onSubmit}>
          <ModalContent>
            <ModalHeader>เพิ่มโจทย์</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack>
                <FormControl>
                  <FormLabel>ชื่อโจทย์</FormLabel>
                  <Input isRequired name="name" placeholder="ชื่อโจทย์" />
                </FormControl>
                <FormControl>
                  <FormLabel>เวลา (ms)</FormLabel>
                  <Input
                    isRequired
                    name="timeLimit"
                    placeholder="เวลา"
                    type="number"
                    defaultValue={1000}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>หน่วยความจำ (MB)</FormLabel>
                  <Input
                    isRequired
                    name="memoryLimit"
                    placeholder="หน่วยความจำ"
                    type="number"
                    defaultValue={32}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>คะแนน</FormLabel>
                  <Input
                    isRequired
                    name="score"
                    type="number"
                    defaultValue={100}
                    placeholder="คะแนน"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>จำนวนเทสต์เคส</FormLabel>
                  <Input
                    isRequired
                    name="case"
                    type="number"
                    defaultValue={10}
                    placeholder="เทสต์เคส"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>โจทย์ (PDF)</FormLabel>
                  <FileInput required name="pdf" accept=".pdf" {...pdfProps} />
                </FormControl>
                <FormControl>
                  <FormLabel>เทสต์เคส (ZIP)</FormLabel>
                  <FileInput
                    required
                    name="zip"
                    accept=".zip,.zpi"
                    {...zipProps}
                  />
                  <FormHelperText>
                    Testcase Files อยู่ในรูปแบบ 1.in, 1.sol, ...
                  </FormHelperText>
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" type="submit">
                เพิ่ม
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

interface EditProblemModalProps {
  problem: ProblemWithSubmission
  editModal: UseDisclosureReturn
}

const EditProblemModal = (props: EditProblemModalProps) => {
  const { problem, editModal } = props
  const {
    resetFile: resetPdfInput,
    fileInputProps: pdfProps,
    file: pdf,
  } = useFileInput()
  const {
    resetFile: resetZipInput,
    fileInputProps: zipProps,
    file: zip,
  } = useFileInput()

  const http = useHttp()
  const { onError } = useErrorToast()
  const { register, handleSubmit } = useForm({ defaultValues: problem })

  // TODO: replace any with other type
  const onSubmit = async (value: any) => {
    try {
      const formData = new FormData()
      Object.keys(value).forEach((key) => formData.append(key, value[key]))
      pdf && formData.append('pdf', pdf)
      zip && formData.append('zip', zip)
      await http.put(`problem/${problem.id}`, formData)
      mutate('problem')
      editModal.onClose()
      resetPdfInput()
      resetZipInput()
    } catch (e: any) {
      onError(e)
    }
  }

  const confirm = useConfirmModal()
  const onDelete = async () => {
    confirm({
      cancleText: 'ยกเลิก',
      submitText: 'ยืนยัน',
      title: 'ยืนยันลบโจทย์',
      subtitle: `คุณยืนยันที่จะลบข้อ ${problem.name} ใช่หรือไม่`,
      onSubmit: async () => {
        try {
          await http.del(`problem/${problem.id}`)
          mutate('problem')
          editModal.onClose()
        } catch (e: any) {
          onError(e)
        }
      },
    })
  }

  return (
    <Modal {...editModal} size="sm">
      <ModalOverlay />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          <ModalHeader>แก้ไข {problem.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <FormControl>
                <FormLabel>ชื่อโจทย์</FormLabel>
                <Input
                  isRequired
                  {...register('name')}
                  placeholder="ชื่อโจทย์"
                />
              </FormControl>
              <FormControl>
                <FormLabel>เวลา (ms)</FormLabel>
                <Input
                  isRequired
                  {...register('timeLimit')}
                  placeholder="เวลา"
                  type="number"
                  defaultValue={1000}
                />
              </FormControl>
              <FormControl>
                <FormLabel>หน่วยความจำ (MB)</FormLabel>
                <Input
                  isRequired
                  {...register('memoryLimit')}
                  placeholder="หน่วยความจำ"
                  type="number"
                  defaultValue={32}
                />
              </FormControl>
              <FormControl>
                <FormLabel>คะแนน</FormLabel>
                <Input
                  isRequired
                  {...register('score')}
                  type="number"
                  defaultValue={100}
                  placeholder="คะแนน"
                />
              </FormControl>
              <FormControl>
                <FormLabel>จำนวนเทสต์เคส</FormLabel>
                <Input
                  isRequired
                  {...register('case')}
                  type="number"
                  defaultValue={10}
                  placeholder="เทสต์เคส"
                />
              </FormControl>
              <FormControl>
                <FormLabel>โจทย์ (PDF)</FormLabel>
                <FileInput name="pdf" accept=".pdf" {...pdfProps} />
              </FormControl>
              <FormControl>
                <FormLabel>เทสต์เคส (ZIP)</FormLabel>
                <FileInput name="zip" accept=".zip,.zpi" {...zipProps} />
                <FormHelperText>
                  Testcase Files อยู่ในรูปแบบ 1.in, 1.sol, ...
                </FormHelperText>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Flex w="100%">
              <Button colorScheme="red" onClick={onDelete} variant="ghost">
                ลบ
              </Button>
              <Spacer />
              <Button colorScheme="green" type="submit">
                แก้ไข
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

const ProblemAdminTable = () => {
  const { data: problems } = useProblems()
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
            <ProblemAdminRow key={problem.id} problem={problem} />
          ))}
          {problems.slice(100).map((problem, index) => (
            <RenderLater key={problem.id} delay={~~(index / 100)}>
              <ProblemAdminRow problem={problem} />
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

interface ProblemAdminProps {
  problem: ProblemWithSubmission
}

const ProblemAdminRow = (props: ProblemAdminProps) => {
  const { problem } = props
  const [isOpen, setOpen] = useState(problem.show)
  const http = useHttp()
  const { onError } = useErrorToast()
  const onToggle = async () => {
    setOpen((isOpen) => !isOpen)
    try {
      const { show } = await http.patch<Problem>(`problem/${problem.id}`, {
        show: !isOpen,
      })
      setOpen(show)
    } catch (e: any) {
      onError(e)
      setOpen(isOpen)
    }
  }

  const editModal = useDisclosure()

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
        <ButtonGroup isAttached>
          <IconButton
            icon={<FaPencilAlt />}
            aria-label="config"
            colorScheme="blue"
            onClick={editModal.onOpen}
          />
          <EditProblemModal editModal={editModal} problem={problem} />
          <IconButton
            icon={isOpen ? <FaEye /> : <FaEyeSlash />}
            aria-label="open-or-close"
            colorScheme={isOpen ? 'orange' : 'gray'}
            onClick={onToggle}
          />
          <IconButton icon={<FaSync />} aria-label="config" disabled />
        </ButtonGroup>
      </Td>
    </Tr>
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
