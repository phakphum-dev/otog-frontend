import { Img, Input, Stack } from '@chakra-ui/react'
import { CenteredCard } from '@src/components/Login'
import { OrangeButton } from '@src/components/OrangeButton'
import { PageContainer } from '@src/components/PageContainer'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useToastError } from '@src/utils/error'
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
  const { onError, toast } = useToastError()
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
            <Img src="logo512.png" boxSize="100px" mx="auto" />
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
      </CenteredCard>
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
