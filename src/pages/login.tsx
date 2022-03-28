import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

import { CenteredCard, LoginForm } from '@src/components/Login'
import { PageContainer } from '@src/components/layout/PageContainer'
import { getServerSideCookies } from '@src/context/HttpClient'

export default function LoginPage() {
  const router = useRouter()
  return (
    <PageContainer>
      <CenteredCard>
        <LoginForm onSuccess={() => router.replace('/problem')} />
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
        destination: '/problem',
      },
    }
  }
  return serverSideCookies
}
