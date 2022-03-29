import Head from 'next/head'
import NextLink from 'next/link'
import { FaTasks } from 'react-icons/fa'

import { Button } from '@chakra-ui/button'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useAuth } from '@src/context/AuthContext'
import { AllSubmissionTable } from '@src/submission/SubmissionTable'

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

export { getServerSideCookies as getServerSideProps } from '@src/context/HttpClient'
