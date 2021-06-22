import { Button, Img, Input, Stack } from '@chakra-ui/react'
import { CenteredCard } from '@src/components/Login'
import { PageContainer } from '@src/components/PageContainer'
import { useHttp } from '@src/api/HttpProvider'
import { useErrorToast } from '@src/hooks/useError'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
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
    } catch (e) {
      onError(e)
    }
  }
  return (
    <PageContainer>
      <CenteredCard>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <Img src="/logo512.png" boxSize={100} mx="auto" />
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

export { getNotFound as getServerSideProps } from '@src/api'
// export { getServerSideCookies as getServerSideProps } from '@src/api'
