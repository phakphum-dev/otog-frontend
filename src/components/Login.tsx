import NextLink from 'next/link'
import {
  Box,
  BoxProps,
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

import { useToastError } from '@src/utils/error'
import { LoginReq, useAuth } from '@src/utils/api/AuthProvider'

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
          <LoginForm onSuccess={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm(props: LoginFormProps) {
  const { onSuccess } = props
  const { register, handleSubmit } = useForm()
  const { onError, toast } = useToastError()
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
    } catch (e) {
      onError(e)
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Img src="logo512.png" boxSize="100px" mx="auto" />
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
  )
}

export function CenteredCard(props: BoxProps) {
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
