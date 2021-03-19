import NextLink from 'next/link'
import { Box, Button, Divider, Img, Input, Stack } from '@chakra-ui/react'
import { OrangeButton } from '@src/components/OrangeButton'
import { PageContainer } from '@src/components/PageContainer'

import { useForm } from 'react-hook-form'

import { useRouter } from 'next/router'
import { AxiosError } from 'axios'
import nookies from 'nookies'
import { useError } from '@src/utils/hooks/useError'
import { useHttp } from '@src/utils/api/HttpProvider'

interface LoginReqDTO {
  username: string
  password: string
}

interface UserAuthDTO {
  id: number
  username: string
  showName: string
  role: string
  rating: number
}
interface AuthResDTO {
  user: UserAuthDTO
  accessToken: string
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm()
  const router = useRouter()
  const [onError, toast] = useError()
  const { http } = useHttp()
  const onSubmit = async (credentials: LoginReqDTO) => {
    try {
      const { accessToken } = await http.post<LoginReqDTO, AuthResDTO>(
        'auth/login',
        credentials
      )
      nookies.set(null, 'accessToken', accessToken)
      router.replace('/problem')
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
          return
        }
      }
      onError(e)
    }
  }
  return (
    <PageContainer>
      <Stack align="center" mt={16}>
        <Img src="logo512.png" boxSize="100px" />
        <Box boxShadow="md" borderRadius="md" p={4}>
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
        </Box>
      </Stack>
    </PageContainer>
  )
}

export { getServerSideColorMode as getServerSideProps } from '@src/theme/ColorMode'
