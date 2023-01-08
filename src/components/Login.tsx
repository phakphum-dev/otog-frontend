import Image from 'next/image'
import NextLink from 'next/link'
import { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

import Logo from '../../public/logo512.png'

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react'

import { OFFLINE_MODE } from '@src/config'
import { useAuth } from '@src/context/AuthContext'
import { useErrorToast } from '@src/hooks/useErrorToast'
import { Button } from '@src/ui/Button'
import { Input } from '@src/ui/Input'
import { LoginReq } from '@src/user/types'

export interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LoginModal = (props: LoginModalProps) => {
  const { isOpen, onClose } = props
  const { refresh } = useAuth()
  const onSuccess = () => {
    onClose()
    refresh()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody py={8}>
          <LoginForm onSuccess={onSuccess} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export interface LoginFormProps {
  onSuccess?: () => void
}

export const LoginForm = (props: LoginFormProps) => {
  const { onSuccess } = props
  const { register, handleSubmit } = useForm<LoginReq>()
  const onError = useErrorToast()
  const { login } = useAuth()
  const onSubmit = async (credentials: LoginReq) => {
    try {
      await login(credentials)
      onSuccess?.()
      toast.success('ลงชื่อเข้าใช้สำเร็จ !')
    } catch (e: any) {
      onError(e)
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <div className="mx-auto w-[100px]">
          <Image src={Logo} />
        </div>
        <Input
          {...register('username')}
          type="text"
          placeholder="ชื่อผู้ใช้"
          autoFocus
          required
        />
        <Input
          {...register('password')}
          type="password"
          placeholder="รหัสผ่าน"
          required
        />
        <Button type="submit" colorScheme="otog">
          เข้าสู่ระบบ
        </Button>
        {!OFFLINE_MODE && (
          <>
            <hr />
            <NextLink href="/register" passHref>
              <Button as="a">ลงทะเบียน</Button>
            </NextLink>
          </>
        )}
      </div>
    </form>
  )
}

export const CenteredCard = ({ children }: { children: ReactNode }) => {
  return (
    <div className="p-4 my-16 mx-auto w-max shadow-md border rounded-md">
      {children}
    </div>
  )
}
