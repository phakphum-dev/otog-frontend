import Head from 'next/head'
import NextLink from 'next/link'
import { parseCookies } from 'nookies'
import { FaTasks } from 'react-icons/fa'

import { getLatestSubmission } from '../queries'

import { Button } from '@chakra-ui/button'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { withCookies } from '@src/context/HttpClient'
import { SubmissionTable } from '@src/submission/SubmissionTable'

export default function SubmissionPage() {
  return (
    <PageContainer>
      <Head>
        <title>Submission | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTasks}>ผลตรวจ</Title>
        <NextLink href="/submission/all" passHref>
          <Button as="a" variant="outline">
            ผลตรวจรวม
          </Button>
        </NextLink>
      </TitleLayout>
      <SubmissionTable />
    </PageContainer>
  )
}

export const getServerSideProps = withCookies(async (context) => {
  const { accessToken = null } = parseCookies(context)
  if (accessToken) {
    const latestSubmission = getLatestSubmission()
    return {
      props: {
        fallback: { 'submission/latest': await latestSubmission },
      },
    }
  }
  return {
    redirect: {
      permanent: false,
      destination: '/submission/all',
    },
  }
})
