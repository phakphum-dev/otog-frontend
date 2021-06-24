import { Button } from '@chakra-ui/button'
import { PageContainer } from '@src/components/PageContainer'
import { AllSubmissionTable } from '@src/components/SubmissionTable'
import { Title, TitleLayout } from '@src/components/Title'
import { getUserData, useAuth } from '@src/api/AuthProvider'
import Head from 'next/head'
import NextLink from 'next/link'
import { FaTasks } from 'react-icons/fa'
import { parseCookies } from 'nookies'
import { getServerSideCookies } from '@src/api'
import { GetServerSideProps } from 'next'

export default function SubmissionPage() {
  const { isAuthenticated } = useAuth()
  return (
    <PageContainer>
      <Head>
        <title>Submission | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTasks}>ผลตรวจรวม</Title>
        {/* {isAuthenticated && (
          <NextLink href="/submission" passHref>
            <Button as="a">ผลตรวจของคุณ</Button>
          </NextLink>
        )} */}
      </TitleLayout>
      <AllSubmissionTable />
    </PageContainer>
  )
}

// export { getServerSideCookies as getServerSideProps } from '@src/api'
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { accessToken = null } = parseCookies(context)
  const userData = getUserData(accessToken)
  if (userData?.role === 'admin') {
    return getServerSideCookies(context)
  }
  return { notFound: true }
}
