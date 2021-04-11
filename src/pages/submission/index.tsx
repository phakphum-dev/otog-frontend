import { Button } from '@chakra-ui/button'
import { HStack } from '@chakra-ui/layout'
import { LatestSubmission } from '@src/components/LatestSubmission'
import { PageContainer } from '@src/components/PageContainer'
import { SubmissionTable } from '@src/components/SubmissionTable'
import { Title } from '@src/components/Title'
import { getServerSideFetch } from '@src/utils/api'
import { SubmissionWithProblem } from '@src/utils/api/Submission'
import { InitialDataProvider } from '@src/utils/hooks/useInitialData'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import { parseCookies } from 'nookies'
import { FaTasks } from 'react-icons/fa'

interface SubmissionPageProps {
  initialData: SubmissionWithProblem
}

export default function SubmissionPage(props: SubmissionPageProps) {
  const { initialData } = props

  return (
    <InitialDataProvider value={initialData}>
      <PageContainer>
        <HStack justify="space-between">
          <Title icon={FaTasks}>ผลตรวจ</Title>
          <NextLink href="/submission/all">
            <Button>ผลตรวจรวม</Button>
          </NextLink>
        </HStack>
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
    return getServerSideFetch<SubmissionWithProblem>(
      'submission/latest',
      context
    )
  }
  return {
    redirect: {
      permanent: false,
      destination: '/submission/all',
    },
  }
}
