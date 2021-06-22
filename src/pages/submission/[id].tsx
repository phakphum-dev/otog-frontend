import { CodeSubmission } from '@src/components/Code'
import { PageContainer } from '@src/components/PageContainer'
import { Title, TitleLayout } from '@src/components/Title'
import { getServerSideFetch } from '@src/api'
import { SubmissionWithSourceCode } from '@src/hooks/useSubmission'

import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { FaTasks } from 'react-icons/fa'

interface SubmissionIdPageProps {
  submission: SubmissionWithSourceCode
}

export default function SubmissionPage(props: SubmissionIdPageProps) {
  const { submission } = props
  return (
    <PageContainer dense>
      <Head>
        <title>Submission #{submission.id} | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTasks}>ผลตรวจที่ {submission.id}</Title>
      </TitleLayout>
      <CodeSubmission submission={submission} />
    </PageContainer>
  )
}

export { getNotFound as getServerSideProps } from '@src/api'
const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  return getServerSideFetch<SubmissionIdPageProps>(context, async (api) => ({
    submission: await api.get(`submission/${id}`),
  }))
}
