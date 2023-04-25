import Head from 'next/head'
import { useRouter } from 'next/router'

import { withSession } from '@src/api/withSession'
import { CenteredCard, LoginForm } from '@src/components/Login'
import { PageContainer } from '@src/components/layout/PageContainer'
import { OFFLINE_MODE } from '@src/config'

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
  // const serverSideCookies = getServerSideCookies(context)
  // if (serverSideCookies.props.accessToken) {
  //   return {
  //     redirect: {
  //       permanent: false,
  //       destination: OFFLINE_MODE ? '/contest' : '/problem',
  //     },
  //   }
  // }
  // return serverSideCookies
})
