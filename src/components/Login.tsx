import NextLink from 'next/link'
import {
  Box,
  BoxProps,
  Button,
  ChakraProvider,
  Divider,
  FormControl,
  FormLabel,
  Img,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'

import { useForm } from 'react-hook-form'

import { useErrorToast } from '@src/hooks/useError'
import { useAuth } from '@src/api/AuthProvider'
import { LoginReq } from '@src/hooks/useUser'
import { glassTheme, useGlass } from '@src/theme/glass'
import { motion } from 'framer-motion'

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
    } catch (e) {
      onError(e)
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Img src="/logo512.png" boxSize={100} mx="auto" />
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
        {/* <Divider />
        <NextLink href="/register" passHref>
          <Button as="a">ลงทะเบียน</Button>
        </NextLink> */}
      </Stack>
    </form>
  )
}

const MotionBox = motion<BoxProps>(Box)

export const CenteredCard = ({ children }: BoxProps) => {
  const { bg } = useGlass()
  const { isAuthenticated } = useAuth()
  return (
    <ChakraProvider theme={glassTheme}>
      <MotionBox
        p={4}
        // my={16}
        // mx="auto"
        w="max-content"
        boxShadow="lg"
        // borderWidth="1px"
        rounded="2xl"
        bg={bg}
        initial="close"
        animate={isAuthenticated ? 'close' : 'open'}
        variants={{
          close: { opacity: 0, scale: 0.5 },
          open: { opacity: 1, scale: 1 },
        }}
      >
        {children}
      </MotionBox>
    </ChakraProvider>
  )
}
