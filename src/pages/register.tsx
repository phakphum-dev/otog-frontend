import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

import Logo from '../../public/logo512.png'

import { PageContainer } from '@src/components/layout/PageContainer'
import { useMutation } from '@src/hooks/useMutation'
import { Button } from '@src/ui/Button'
import { Input } from '@src/ui/Input'
import { registerUser } from '@src/user/queries'
import { CreateUser } from '@src/user/types'

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<CreateUser>()
  const router = useRouter()

  const registerUserMutation = useMutation(registerUser)
  const onSubmit = async (createUser: CreateUser) => {
    try {
      await registerUserMutation(createUser)
      router.push('/login')
      toast.success(
        <div>
          <b>ลงทะเบียนสำเร็จ</b>
          <p>กรุณาลงชื่อเข้าใช้</p>
        </div>
      )
    } catch {}
  }
  return (
    <PageContainer>
      <Head>
        <title>Register | OTOG</title>
      </Head>
      <div className="mx-auto my-16 w-max rounded-md border p-4 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="mx-auto w-[100px]">
              <Image src={Logo} alt="otog logo" />
            </div>
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
            <Button colorScheme="otog" type="submit">
              ลงทะเบียน
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  )
}
