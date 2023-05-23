import Head from 'next/head'
import { useRouter } from 'next/router'

import { withSession } from '@src/api/withSession'
import { PageContainer } from '@src/components/layout/PageContainer'
import { OFFLINE_MODE } from '@src/config'
import { useForm } from 'react-hook-form'
import { LoginReq } from '@src/user/types'
import { useUserData } from '@src/context/UserContext'
import { signIn } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { errorToast, onErrorToast } from '@src/hooks/useErrorToast'
import Image from 'next/image'

import Logo from '../../public/logo512.png'
import { Input } from '@src/ui/Input'
import { Button } from '@src/ui/Button'

import NextLink from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { register, handleSubmit } = useForm<LoginReq>()
  const { clearCache } = useUserData()
  const onSubmit = async (credentials: LoginReq) => {
    try {
      const response = await signIn('otog', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      })
      if (response?.ok) {
        toast.success('ลงชื่อเข้าใช้สำเร็จ !')
        clearCache()
        router.replace(OFFLINE_MODE ? '/contest' : '/problem')
      } else if (response?.status === 401) {
        errorToast({
          title: 'ลงชื่อเข้าใช้งานไม่สำเร็จ !',
          description: 'ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง',
          status: 'error',
          code: 401,
        })
      } else {
        throw response
      }
    } catch (e: unknown) {
      onErrorToast(e)
    }
  }
  return (
    <PageContainer>
      <Head>
        <title>Login | OTOG</title>
      </Head>
      <div className="mx-auto my-16 w-max rounded-md border p-4 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="mx-auto w-[100px]">
              <Image src={Logo} alt="otog logo" />
            </div>
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
            <Button type="submit" colorScheme="otog">
              เข้าสู่ระบบ
            </Button>
            {/* {session ? (
              <Button onClick={() => signOut()}>Sign out here</Button>
            ) : (
              <Button onClick={() => signIn('google')} leftIcon={<FaGoogle />}>
                ลงชื่อเข้าใช้ด้วย Google
              </Button>
            )} */}
            {!OFFLINE_MODE && (
              <>
                <hr />
                <Button as={NextLink} href="/register">
                  ลงทะเบียน
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </PageContainer>
  )
}

export const getServerSideProps = withSession(async (session) => {
  if (session) {
    return {
      redirect: {
        destination: OFFLINE_MODE ? '/contest' : '/problem',
        permanent: false,
      },
    }
  }
  return { props: {} }
})
