import Head from 'next/head'
import NextLink from 'next/link'
import { FormEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import {
  FaEye,
  FaEyeSlash,
  FaPencilAlt,
  FaPlusCircle,
  FaSync,
  FaTools,
} from 'react-icons/fa'
import { mutate } from 'swr'

import {
  createProblem,
  deleteProblem,
  toggleProblem,
  updateProblem,
} from '@src/admin/queries/problem'
import { withSession } from '@src/api/withSession'
import { FileInput } from '@src/components/FileInput'
import { RenderLater } from '@src/components/RenderLater'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { API_HOST } from '@src/config'
import { useConfirmModal } from '@src/context/ConfirmContext'
import { UseDisclosureReturn, useDisclosure } from '@src/hooks/useDisclosure'
import { onErrorToast } from '@src/hooks/useErrorToast'
import { useFileInput } from '@src/hooks/useFileInput'
import { useMutation } from '@src/hooks/useMutation'
import { useProblems } from '@src/problem/queries'
import { ProblemWithSubmission } from '@src/problem/types'
import { Button } from '@src/ui/Button'
import { ButtonGroup } from '@src/ui/ButtonGroup'
import { IconButton } from '@src/ui/IconButton'
import { FormHelperText, FormLabel, Input } from '@src/ui/Input'
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
import { rejudgeProblem } from '@src/submission/queries'

export default function AdminProblemPage() {
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Admin Problem | OTOG</title>
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
        <div className="flex justify-end">
          <CreateProblemModalButton />
        </div>
        <ProblemAdminTable />
      </div>
    </PageContainer>
  )
}

const CreateProblemModalButton = () => {
  const createModal = useDisclosure()

  const { resetFile: resetPdfInput, fileInputProps: pdfProps } = useFileInput()
  const { resetFile: resetZipInput, fileInputProps: zipProps } = useFileInput()

  // TODO: refactor form data schema
  const createProblemMutation = useMutation(createProblem)
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const promise = createProblemMutation(new FormData(e.currentTarget))
      toast.promise(promise, {
        loading: 'กำลังเพิ่มโจทย์',
        error: 'เพิ่มโจทย์ไม่สำเร็จ',
        success: 'เพิ่มโจทย์สำเร็จ!',
      })
      await promise
      mutate('problem')
      createModal.onClose()
      resetPdfInput()
      resetZipInput()
    } catch (e: unknown) {
      onErrorToast(e)
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
              <div className="flex flex-col gap-4">
                <div>
                  <FormLabel>ชื่อโจทย์</FormLabel>
                  <Input required name="name" placeholder="ชื่อโจทย์" />
                </div>
                <div>
                  <FormLabel>เวลา (ms)</FormLabel>
                  <Input
                    required
                    name="timeLimit"
                    placeholder="เวลา"
                    type="number"
                    defaultValue={1000}
                  />
                </div>
                <div>
                  <FormLabel>หน่วยความจำ (MB)</FormLabel>
                  <Input
                    required
                    name="memoryLimit"
                    placeholder="หน่วยความจำ"
                    type="number"
                    defaultValue={32}
                  />
                </div>
                <div>
                  <FormLabel>คะแนน</FormLabel>
                  <Input
                    required
                    name="score"
                    type="number"
                    defaultValue={100}
                    placeholder="คะแนน"
                  />
                </div>
                <div>
                  <FormLabel>จำนวนเทสต์เคส</FormLabel>
                  <Input
                    required
                    name="case"
                    type="number"
                    defaultValue={10}
                    placeholder="เทสต์เคส"
                  />
                </div>
                <div>
                  <FormLabel>โจทย์ (PDF)</FormLabel>
                  <FileInput name="pdf" accept=".pdf" {...pdfProps} />
                </div>
                <div>
                  <FormLabel>เทสต์เคส (ZIP)</FormLabel>
                  <FileInput name="zip" accept=".zip,.zpi" {...zipProps} />
                  <FormHelperText>
                    Testcase Files อยู่ในรูปแบบ 1.in, 1.sol, ...
                  </FormHelperText>
                </div>
              </div>
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

  const { register, handleSubmit } = useForm({ defaultValues: problem })

  // TODO: replace any with other type
  const updateProblemMutation = useMutation(updateProblem)
  const onSubmit = async (value: any) => {
    try {
      const formData = new FormData()
      Object.keys(value).forEach((key) => formData.append(key, value[key]))
      pdf && formData.append('pdf', pdf)
      zip && formData.append('zip', zip)

      const promise = updateProblemMutation(problem.id, formData)
      toast.promise(promise, {
        loading: 'กำลังแก้โจทย์',
        error: 'แก้โจทย์ไม่สำเร็จ',
        success: 'แก้โจทย์สำเร็จ!',
      })
      await promise
      mutate('problem')
      editModal.onClose()
      resetPdfInput()
      resetZipInput()
    } catch {}
  }

  const confirm = useConfirmModal()
  const deleteProblemMutation = useMutation(deleteProblem)
  const onDelete = async () => {
    confirm({
      cancleText: 'ยกเลิก',
      submitText: 'ยืนยัน',
      title: 'ยืนยันลบโจทย์',
      subtitle: `คุณยืนยันที่จะลบข้อ ${problem.name} ใช่หรือไม่`,
      onSubmit: async () => {
        try {
          await deleteProblemMutation(problem.id)
          mutate('problem')
          editModal.onClose()
        } catch {}
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
            <div className="flex flex-col gap-4">
              <div>
                <FormLabel>ชื่อโจทย์</FormLabel>
                <Input required {...register('name')} placeholder="ชื่อโจทย์" />
              </div>
              <div>
                <FormLabel>เวลา (ms)</FormLabel>
                <Input
                  required
                  {...register('timeLimit')}
                  placeholder="เวลา"
                  type="number"
                  defaultValue={1000}
                />
              </div>
              <div>
                <FormLabel>หน่วยความจำ (MB)</FormLabel>
                <Input
                  required
                  {...register('memoryLimit')}
                  placeholder="หน่วยความจำ"
                  type="number"
                  defaultValue={32}
                />
              </div>
              <div>
                <FormLabel>คะแนน</FormLabel>
                <Input
                  required
                  {...register('score')}
                  type="number"
                  defaultValue={100}
                  placeholder="คะแนน"
                />
              </div>
              <div>
                <FormLabel>จำนวนเทสต์เคส</FormLabel>
                <Input
                  required
                  {...register('case')}
                  type="number"
                  defaultValue={10}
                  placeholder="เทสต์เคส"
                />
              </div>
              <div>
                <FormLabel>โจทย์ (PDF)</FormLabel>
                <FileInput name="pdf" accept=".pdf" {...pdfProps} />
              </div>
              <div>
                <FormLabel>เทสต์เคส (ZIP)</FormLabel>
                <FileInput name="zip" accept=".zip,.zpi" {...zipProps} />
                <FormHelperText>
                  Testcase Files อยู่ในรูปแบบ 1.in, 1.sol, ...
                </FormHelperText>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full">
              <Button colorScheme="red" onClick={onDelete} variant="ghost">
                ลบ
              </Button>
              <div className="flex-1" />
              <Button colorScheme="green" type="submit">
                แก้ไข
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

const ProblemAdminTable = () => {
  const { data: problems } = useProblems()
  return problems ? (
    <div className="overflow-x-auto">
      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>ชื่อ</Th>
            <Th>แก้ไข</Th>
          </tr>
        </thead>
        <tbody>
          {problems.slice(0, 100).map((problem) => (
            <ProblemAdminRow key={problem.id} problem={problem} />
          ))}
          {problems.slice(100).map((problem, index) => (
            <RenderLater key={problem.id} delay={~~(index / 100)}>
              <ProblemAdminRow problem={problem} />
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

interface ProblemAdminProps {
  problem: ProblemWithSubmission
}

const ProblemAdminRow = (props: ProblemAdminProps) => {
  const { problem } = props
  const [isOpen, setOpen] = useState(problem.show)
  const toggleProblemMutation = useMutation(toggleProblem)
  const onToggle = async () => {
    setOpen((isOpen) => !isOpen)
    try {
      const { show } = await toggleProblemMutation(problem.id, !isOpen)
      setOpen(show)
    } catch {
      setOpen(isOpen)
    }
  }

  const rejudgeProblemMutation = useMutation(rejudgeProblem)
  const rejudge = async () => {
    try {
      const promise = rejudgeProblemMutation(problem.id)
      toast.promise(promise, {
        loading: 'กำลังตรวจใหม่',
        error: 'ส่งตรวจใหม่ไม่สำเร็จ',
        success: 'ส่งตรวจใหม่สำเร็จ',
      })
    } catch (e) {
      onErrorToast(e)
    }
  }
  const editModal = useDisclosure()

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
          <IconButton
            icon={<FaSync />}
            aria-label="config"
            colorScheme="yellow"
            onClick={rejudge}
          />
        </ButtonGroup>
      </Td>
    </tr>
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
