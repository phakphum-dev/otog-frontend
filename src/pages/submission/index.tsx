import Head from 'next/head'
import NextLink from 'next/link'
import { FaTasks } from 'react-icons/fa'

import { getLatestSubmission } from '../../submission/queries'

import { withSession } from '@src/api/withSession'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { SubmissionTable } from '@src/submission/SubmissionTable'
import { Button } from '@src/ui/Button'

export default function SubmissionPage() {
  return (
    <PageContainer>
      <Head>
        <title>Submission | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={<FaTasks />}>ผลตรวจ</Title>
        <NextLink href="/submission/all" passHref legacyBehavior>
          <Button variant="outline">ผลตรวจรวม</Button>
        </NextLink>
      </TitleLayout>
      <SubmissionTable />
    </PageContainer>
  )
}

export const getServerSideProps = withSession(async (session) => {
  if (session) {
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
