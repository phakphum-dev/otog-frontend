import { Button } from '@chakra-ui/button'
import { HStack } from '@chakra-ui/layout'
import { LatestSubmission } from '@src/components/LatestSubmission'
import { PageContainer } from '@src/components/PageContainer'
import { SubmissionTable } from '@src/components/SubmissionTable'
import { Title, TitleLayout } from '@src/components/Title'
import { getServerSideFetch } from '@src/utils/api'
import { SubmissionWithProblem } from '@src/utils/api/Submission'
import { InitialDataProvider } from '@src/utils/hooks/useInitialData'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import { parseCookies } from 'nookies'
import { FaTasks } from 'react-icons/fa'

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
          <NextLink href="/submission/all">
            <Button>ผลตรวจรวม</Button>
          </NextLink>
        </TitleLayout>
        <HStack mb={4}>
          <LatestSubmission />
        </HStack>
        <SubmissionTable />
      </PageContainer>
    </InitialDataProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { accessToken = null } = parseCookies(context)
  if (accessToken) {
    return getServerSideFetch<SubmissionPageProps>(context, async (api) => ({
      latestSubmission: await api.get('submission/latest'),
    }))
  }
  return {
    redirect: {
      permanent: false,
      destination: '/submission/all',
    },
  }
}
