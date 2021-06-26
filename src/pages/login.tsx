import { CenteredCard, LoginForm } from '@src/components/Login'
import { useRouter } from 'next/router'
import { getServerSideCookies } from '@src/api'
import { GetServerSideProps } from 'next'
import { Center } from '@chakra-ui/react'

export default function LoginPage() {
  const router = useRouter()
  return (
    <Center flex={1}>
      <CenteredCard>
        <LoginForm onSuccess={() => router.replace('/contest')} />
      </CenteredCard>
    </Center>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const serverSideCookies = getServerSideCookies(context)
  if (serverSideCookies.props.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/contest',
      },
    }
  }
  return serverSideCookies
}
