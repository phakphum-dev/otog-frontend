import { Box, Img, Input, Stack } from '@chakra-ui/react'
import { OrangeButton } from '@src/components/OrangeButton'
import { PageContainer } from '@src/components/PageContainer'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useError } from '@src/utils/hooks/useError'
import { AxiosError } from 'axios'
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
  const [onError, toast] = useError()
  const { http } = useHttp()
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
      if (e.isAxiosError) {
        const error = e as AxiosError
        if (error.response?.status === 409) {
          const message = error.response.data.message
          if (message === 'username was taken.') {
            toast({
              title: 'ลงทะเบียนไม่สำเร็จ !',
              description: 'ชื่อผู้ใช้นี้ ได้ถูกใช้ไปแล้ว',
              status: 'error',
              isClosable: true,
            })
          } else if (message === 'showName was taken.') {
            toast({
              title: 'ลงทะเบียนไม่สำเร็จ !',
              description: 'ชื่อที่ใช้แสดงนี้ ได้ถูกใช้ไปแล้ว',
              status: 'error',
              isClosable: true,
            })
          }
          return
        }
      }
      onError(e)
    }
  }
  return (
    <PageContainer flex={1}>
      <Stack align="center" mt={16}>
        <Img src="logo512.png" boxSize="100px" />
        <Box boxShadow="md" borderRadius="md" p={4}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <Input
                name="username"
                type="username"
                placeholder="ชื่อผู้ใช้"
                ref={register}
                required
                autoFocus
              />
              <Input
                name="password"
                type="password"
                ref={register}
                required
                placeholder="รหัสผ่าน"
              />
              <Input
                name="showName"
                ref={register}
                required
                placeholder="ชื่อที่ใช้แสดง"
              />
              <OrangeButton colorScheme="orange" type="submit">
                ลงทะเบียน
              </OrangeButton>
            </Stack>
          </form>
        </Box>
      </Stack>
    </PageContainer>
  )
}

export { getServerSideColorMode as getServerSideProps } from '@src/theme/ColorMode'
