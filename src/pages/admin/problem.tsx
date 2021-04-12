import { Button, ButtonGroup, IconButton } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { Input } from '@chakra-ui/input'
import { Box, Flex, Stack, Text } from '@chakra-ui/layout'
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

import { Title } from '@src/components/Title'
import { getServerSideCookies } from '@src/utils/api'
import { getUserData } from '@src/utils/api/AuthProvider'
import {
  Problem,
  ProblemWithSubmission,
  useProblems,
} from '@src/utils/api/Problem'
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { useState } from 'react'
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
import { useForm } from 'react-hook-form'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useToastError } from '@src/utils/hooks/useError'
import { FileInput } from '@src/components/FileInput'
import { mutate } from 'swr'
import { Spinner } from '@chakra-ui/spinner'
import { RenderLater } from '@src/components/RenderLater'

export default function AdminProblemPage() {
  return (
    <PageContainer dense>
      <Flex dir="row" justify="space-between" align="center">
        <Title icon={FaTools}>ระบบ GOTO</Title>
        <Text>
          <NextLink href="/admin/contest">
            <Button>แข่งขัน</Button>
          </NextLink>
        </Text>
      </Flex>
      <CreateProblemModalButton />
      <ProblemAdminTable />
    </PageContainer>
  )
}

function CreateProblemModalButton() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { register, handleSubmit } = useForm()
  const http = useHttp()
  const { onError } = useToastError()
  const onSubmit = async (value: any) => {
    try {
      // TODO: get response data
      await http.post('problem', value)
      mutate('problem')
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
        เพิ่มโจทย์
      </Button>
      <Modal onClose={onClose} isOpen={isOpen} size="sm">
        <ModalOverlay />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>เพิ่มโจทย์</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack>
                <FormControl>
                  <FormLabel>ชื่อโจทย์</FormLabel>
                  <Input
                    ref={register}
                    isRequired
                    name="name"
                    placeholder="ชื่อโจทย์"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>เวลา (s)</FormLabel>
                  <Input
                    ref={register}
                    isRequired
                    name="timeLimit"
                    placeholder="เวลา"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>หน่วยความจำ (MB)</FormLabel>
                  <Input
                    ref={register}
                    isRequired
                    name="memoryLimit"
                    placeholder="หน่วยความจำ"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>คะแนน</FormLabel>
                  <Input
                    ref={register}
                    isRequired
                    name="score"
                    placeholder="คะแนน"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>เทสต์เคส</FormLabel>
                  <Input
                    ref={register}
                    isRequired
                    name="testcase"
                    placeholder="เทสต์เคส"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>โจทย์</FormLabel>
                  <FileInput isRequired name="pdf" />
                </FormControl>
                <FormControl>
                  <FormLabel>เทสต์เคส (ZIP)</FormLabel>
                  <FileInput isRequired name="zip" />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" type="submit" disabled>
                สร้าง
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
  const { onError } = useToastError()
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
      <Td>{problem.name}</Td>
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
