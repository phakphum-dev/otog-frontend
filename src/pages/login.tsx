import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { CenteredCard, LoginForm } from '@src/components/Login'
import { PageContainer } from '@src/components/layout/PageContainer'
import { OFFLINE_MODE } from '@src/config'
import { getServerSideCookies } from '@src/context/HttpClient'

export default function LoginPage() {
  const router = useRouter()
  return (
    <PageContainer>
      <Head>
        <title>Login | OTOG</title>
      </Head>
      <CenteredCard>
        <LoginForm
          onSuccess={() =>
            router.replace(OFFLINE_MODE ? '/contest' : '/problem')
          }
        />
      </CenteredCard>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const serverSideCookies = getServerSideCookies(context)
  if (serverSideCookies.props.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: OFFLINE_MODE ? '/contest' : '/problem',
      },
    }
  }
  return serverSideCookies
}
