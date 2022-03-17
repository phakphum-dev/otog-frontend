import Image from 'next/image'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

import Logo from '../../public/logo512.png'

import { Box, Button, Input, Stack } from '@chakra-ui/react'

import { useHttp } from '@src/api/HttpProvider'
import { CenteredCard } from '@src/components/Login'
import { PageContainer } from '@src/components/PageContainer'
import { useErrorToast } from '@src/hooks/useError'

interface CreateUserDTO {
  username: string
  password: string
  showName: string
}

export default function RegisterPage() {
  const { register, handleSubmit } = useForm()
  const router = useRouter()
  const { onError, toast } = useErrorToast()
  const http = useHttp()
  const onSubmit = async (createUser: CreateUserDTO) => {
    try {
      await http.post('auth/register', createUser)
      router.push('/login')
      toast({
        title: 'ลงทะเบียนสำเร็จ',
        description: 'กรุณาลงชื่อเข้าใช้',
        status: 'success',
        isClosable: true,
      })
    } catch (e: any) {
      onError(e)
    }
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

export { getServerSideCookies as getServerSideProps } from '@src/api'
