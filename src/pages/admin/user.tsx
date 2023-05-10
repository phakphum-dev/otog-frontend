import Head from 'next/head'
import NextLink from 'next/link'
import { useForm } from 'react-hook-form'
import { FaPencilAlt, FaPlusCircle, FaTools } from 'react-icons/fa'
import { mutate } from 'swr'

import { editUser } from '@src/admin/queries/user'
import { withSession } from '@src/api/withSession'
import { RenderLater } from '@src/components/RenderLater'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { UseDisclosureReturn, useDisclosure } from '@src/hooks/useDisclosure'
import { useMutation } from '@src/hooks/useMutation'
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
import { registerUser } from '@src/user/queries'
import { useUsers } from '@src/user/queries'
import { CreateUser, EditUser, User } from '@src/user/types'

export default function AdminProblemPage() {
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Admin User | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={<FaTools />}>ระบบ GOTO</Title>
        <div className="flex gap-2">
          <Button as={NextLink} href="/admin/contest">
            แข่งขัน
          </Button>
          <Button as={NextLink} href="/admin/problem">
            โจทย์
          </Button>
          <Button as={NextLink} href="/admin/user">
            ผู้ใช้งาน
          </Button>
        </div>
      </TitleLayout>

      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <CreateUserModalButton />
        </div>
        <UserAdminTable />
      </div>
    </PageContainer>
  )
}

const CreateUserModalButton = () => {
  const createModal = useDisclosure()

  const { register, reset, handleSubmit } = useForm<CreateUser>()
  // TODO: form type
  const createUserMutation = useMutation(registerUser)
  const onSubmit = async (value: CreateUser) => {
    try {
      await createUserMutation(value)
      mutate('user')
      createModal.onClose()
      reset()
    } catch {}
  }

  return (
    <>
      <Button
        colorScheme="green"
        leftIcon={<FaPlusCircle />}
        onClick={createModal.onOpen}
      >
        เพิ่มผู้ใช้งาน
      </Button>
      <Modal {...createModal} size="sm">
        <ModalOverlay />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>เพิ่มผู้ใช้งาน</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div>
                  <FormLabel>ชื่อผู้ใช้</FormLabel>
                  <Input
                    required
                    {...register('username')}
                    placeholder="ชื่อผู้ใช้"
                  />
                </div>
                <div>
                  <FormLabel>รหัสผ่าน</FormLabel>
                  <Input
                    required
                    {...register('password')}
                    placeholder="รหัสผ่าน"
                  />
                </div>
                <div>
                  <FormLabel>ชื่อที่ใช้แสดง</FormLabel>
                  <Input
                    required
                    {...register('showName')}
                    placeholder="ชื่อที่ใช้แสดง"
                  />
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

interface EditUserModalProps {
  user: User
  editModal: UseDisclosureReturn
}
const EditUserModalButton = (props: EditUserModalProps) => {
  const { user, editModal } = props
  const { register, reset, handleSubmit } = useForm<EditUser>({
    defaultValues: user,
  })
  const editUserMutation = useMutation(editUser)
  const onSubmit = async (value: EditUser) => {
    try {
      await editUserMutation(user.id, value)
      mutate('user')
      editModal.onClose()
      reset({ ...value, password: '' })
    } catch {}
  }

  return (
    <Modal {...editModal} size="sm">
      <ModalOverlay />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          <ModalHeader>แก้ไขผู้ใช้งาน</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div>
                <FormLabel>ชื่อผู้ใช้</FormLabel>
                <Input
                  required
                  {...register('username')}
                  placeholder="ชื่อผู้ใช้"
                />
              </div>
              <div>
                <FormLabel>รหัสผ่าน</FormLabel>
                <Input {...register('password')} placeholder="รหัสผ่าน" />
              </div>
              <div>
                <FormLabel>ชื่อที่ใช้แสดง</FormLabel>
                <Input
                  required
                  {...register('showName')}
                  placeholder="ชื่อที่ใช้แสดง"
                />
              </div>
              <div>
                <FormLabel>สถานะ</FormLabel>
                <Select {...register('role')}>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" type="submit">
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}
const UserAdminTable = () => {
  const { data: users } = useUsers()
  return users ? (
    <div className="overflow-x-auto">
      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>ชื่อผู้ใช้</Th>
            <Th>ชื่อที่ใช้แสดง</Th>
            <Th>สถานะ</Th>
            <Th>แก้ไข</Th>
          </tr>
        </thead>
        <tbody>
          {users.slice(0, 100).map((user) => (
            <UserAdminRow key={user.id} user={user} />
          ))}
          {users.slice(100).map((user, index) => (
            <RenderLater key={user.id} delay={~~(index / 100)}>
              <UserAdminRow user={user} />
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
  user: User
}

const UserAdminRow = (props: ProblemAdminProps) => {
  const { user } = props

  const editModal = useDisclosure()

  return (
    <tr>
      <Td>{user.id}</Td>
      <Td className="max-w-[200px]">
        <Link as={NextLink} href={`/profile/${user.id}`} variant="hidden">
          {user.username}
        </Link>
      </Td>
      <Td className="max-w-[200px]">
        <Link as={NextLink} href={`/profile/${user.id}`} variant="hidden">
          {user.showName}
        </Link>
      </Td>
      <Td className="capitalize">{user.role}</Td>
      <Td>
        <IconButton
          icon={<FaPencilAlt />}
          aria-label="config"
          colorScheme="blue"
          onClick={editModal.onOpen}
        />
        <EditUserModalButton editModal={editModal} user={user} />
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
