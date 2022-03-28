import Image from 'next/image'
import NextLink from 'next/link'
import { useForm } from 'react-hook-form'

import Logo from '../../public/logo512.png'

import {
  Box,
  BoxProps,
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'

import { useAuth } from '@src/context/AuthContext'
import { useErrorToast } from '@src/hooks/useError'
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
  const { register, handleSubmit } = useForm()
  const { onError, toast } = useErrorToast()
  const { login } = useAuth()
  const onSubmit = async (credentials: LoginReq) => {
    try {
      await login(credentials)
      onSuccess?.()
      toast({
        title: 'ลงชื่อเข้าใช้สำเร็จ !',
        status: 'success',
        duration: 2000,
      })
    } catch (e: any) {
      onError(e)
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Box boxSize={100} mx="auto">
          <Image src={Logo} />
        </Box>
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
        <Button type="submit" variant="otog">
          เข้าสู่ระบบ
        </Button>
        <Divider />
        <NextLink href="/register" passHref>
          <Button as="a">ลงทะเบียน</Button>
        </NextLink>
      </Stack>
    </form>
  )
}

export const CenteredCard = (props: BoxProps) => {
  return (
    <Box
      p={4}
      my={16}
      mx="auto"
      w="max-content"
      boxShadow="md"
      borderWidth="1px"
      borderRadius="md"
      {...props}
    />
  )
}
