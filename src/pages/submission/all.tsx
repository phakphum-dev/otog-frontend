import { Button } from '@chakra-ui/button'
import { PageContainer } from '@src/components/PageContainer'
import { AllSubmissionTable } from '@src/components/SubmissionTable'
import { Title, TitleLayout } from '@src/components/Title'
import { useAuth } from '@src/api/AuthProvider'
import Head from 'next/head'
import NextLink from 'next/link'
import { FaTasks } from 'react-icons/fa'

export default function SubmissionPage() {
  const { isAuthenticated } = useAuth()
  return (
    <PageContainer>
      <Head>
        <title>Submission | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTasks}>ผลตรวจรวม</Title>
        {isAuthenticated && (
          <NextLink href="/submission" passHref>
            <Button as="a">ผลตรวจของคุณ</Button>
          </NextLink>
        )}
      </TitleLayout>
      <AllSubmissionTable />
    </PageContainer>
  )
}

export { getNotFound as getServerSideProps } from '@src/api'
// export { getServerSideCookies as getServerSideProps } from '@src/api'
