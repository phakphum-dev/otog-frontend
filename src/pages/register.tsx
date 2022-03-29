import Image from 'next/image'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

import Logo from '../../public/logo512.png'

import { Box, Button, Input, Stack, useToast } from '@chakra-ui/react'

import { CenteredCard } from '@src/components/Login'
import { PageContainer } from '@src/components/layout/PageContainer'
import { useMutation } from '@src/hooks/useMutation'
import { registerUser } from '@src/user/queries'
import { CreateUser } from '@src/user/types'

export default function RegisterPage() {
  const { register, handleSubmit } = useForm()
  const router = useRouter()
  const toast = useToast()

  const registerUserMutation = useMutation(registerUser)
  const onSubmit = async (createUser: CreateUser) => {
    try {
      await registerUserMutation(createUser)
      router.push('/login')
      toast({
        title: 'ลงทะเบียนสำเร็จ',
        description: 'กรุณาลงชื่อเข้าใช้',
        status: 'success',
        isClosable: true,
      })
    } catch {}
  }
  return (
    <PageContainer>
      <CenteredCard>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <Box boxSize={100} mx="auto">
              <Image src={Logo} />
            </Box>
            <Input
              {...register('username')}
              type="username"
              placeholder="ชื่อผู้ใช้"
              required
              autoFocus
            />
            <Input
              {...register('password')}
              type="password"
              required
              placeholder="รหัสผ่าน"
            />
            <Input
              {...register('showName')}
              required
              placeholder="ชื่อที่ใช้แสดง"
            />
            <Button variant="otog" type="submit">
              ลงทะเบียน
            </Button>
          </Stack>
        </form>
      </CenteredCard>
    </PageContainer>
  )
}

export { getServerSideCookies as getServerSideProps } from '@src/context/HttpClient'
