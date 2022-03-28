import { GetServerSideProps } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import { parseCookies } from 'nookies'
import { FaTasks } from 'react-icons/fa'

import { Button } from '@chakra-ui/button'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { getServerSideFetch } from '@src/context/HttpClient'
import { InitialDataProvider } from '@src/context/InitialDataContext'
import { SubmissionTable } from '@src/submission/SubmissionTable'
import { SubmissionWithProblem } from '@src/submission/useSubmission'

interface SubmissionPageProps {
  latestSubmission: SubmissionWithProblem
}

export default function SubmissionPage(props: SubmissionPageProps) {
  const { latestSubmission } = props
  return (
    <InitialDataProvider value={latestSubmission}>
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
    </InitialDataProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { accessToken = null } = parseCookies(context)
  if (accessToken) {
    return getServerSideFetch<SubmissionPageProps>(context, async (client) => ({
      latestSubmission: await client.get('submission/latest'),
    }))
  }
  return {
    redirect: {
      permanent: false,
      destination: '/submission/all',
    },
  }
}
