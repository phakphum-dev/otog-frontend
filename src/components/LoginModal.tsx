import NextLink from 'next/link'
import {
  Box,
  Button,
  Divider,
  Img,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'
import { OrangeButton } from '@src/components/OrangeButton'

import { useForm } from 'react-hook-form'

import { AxiosError } from 'axios'
import { useError } from '@src/utils/hooks/useError'
import { LoginReqDTO, useAuth } from '@src/utils/api/AuthProvider'

export interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal(props: LoginModalProps) {
  const { isOpen, onClose } = props
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody py={8}>
          <Login onSuccess={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export interface LoginProps {
  onSuccess?: () => void
}

export function Login(props: LoginProps) {
  const { onSuccess } = props
  const { register, handleSubmit } = useForm()
  const [onError, toast] = useError()
  const { login } = useAuth()
  const onSubmit = async (credentials: LoginReqDTO) => {
    try {
      await login(credentials)
      onSuccess?.()
      toast({
        title: 'ลงชื่อเข้าใช้งานสำเร็จ !',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (e) {
      if (e.isAxiosError) {
        const error = e as AxiosError
        if (error.response?.status === 401) {
          toast({
            title: 'ลงชื่อเข้าใช้งานไม่สำเร็จ !',
            description: 'ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง',
            status: 'error',
            isClosable: true,
          })
        }
        return
      }
      onError(e)
    }
  }
  return (
    <Stack align="center" spacing={4}>
      <Img src="logo512.png" boxSize="100px" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <Input
            type="text"
            name="username"
            placeholder="ชื่อผู้ใช้"
            ref={register}
            autoFocus
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="รหัสผ่าน"
            ref={register}
            required
          />
          <OrangeButton type="submit">เข้าสู่ระบบ</OrangeButton>
          <Divider />
          <NextLink href="/register">
            <Button>ลงทะเบียน</Button>
          </NextLink>
        </Stack>
      </form>
    </Stack>
  )
}
