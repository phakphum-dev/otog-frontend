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

import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import { PageContainer } from '@src/components/PageContainer'

import { Title, TitleLayout } from '@src/components/Title'
import { API_HOST, getServerSideCookies } from '@src/utils/api'
import { getUserData } from '@src/utils/api/AuthProvider'
import {
  Problem,
  ProblemWithSubmission,
  useProblems,
} from '@src/utils/api/Problem'
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { FormEvent, useState } from 'react'
import {
  FaEye,
  FaEyeSlash,
  FaPencilAlt,
  FaPlusCircle,
  FaSync,
  FaTools,
  FaTrash,
} from 'react-icons/fa'
import NextLink from 'next/link'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useErrorToast } from '@src/utils/hooks/useError'
import { FileInput } from '@src/components/FileInput'
import { mutate } from 'swr'
import { Spinner } from '@chakra-ui/spinner'
import { RenderLater } from '@src/components/RenderLater'
import Head from 'next/head'
import { useFileInput } from '@src/utils/hooks/useInput'

export default function AdminProblemPage() {
  return (
    <PageContainer dense>
      <Head>
        <title>Admin Problem | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTools}>ระบบ GOTO</Title>
        <Text>
          <NextLink href="/admin/contest" passHref>
            <Button as="a">แข่งขัน</Button>
          </NextLink>
        </Text>
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

  const { resetFileInput: resetPdfInput, fileProps: pdfProps } = useFileInput()
  const { resetFileInput: resetZipInput, fileProps: zipProps } = useFileInput()

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
                  <FileInput
                    isRequired
                    name="pdf"
                    accept=".pdf"
                    {...pdfProps}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>เทสต์เคส (ZIP)</FormLabel>
                  <FileInput
                    isRequired
                    name="zip"
                    accept=".zip,.zpi"
                    {...zipProps}
                  />
                  <FormHelperText>
                    ไฟล์เทสต์เคสอยู่ในรูปแบบ x.in, x.sol โดยที่ x เริ่มที่ 1
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
        <ButtonGroup isAttached>
          <IconButton icon={<FaPencilAlt />} aria-label="config" disabled />
          <IconButton
            icon={isOpen ? <FaEye /> : <FaEyeSlash />}
            aria-label="open-or-close"
            colorScheme={isOpen ? 'orange' : 'gray'}
            onClick={onToggle}
          />
          <IconButton icon={<FaSync />} aria-label="config" disabled />
          <IconButton icon={<FaTrash />} aria-label="config" disabled />
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
