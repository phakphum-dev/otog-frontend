import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { FaTasks } from 'react-icons/fa'

import { Link } from '@chakra-ui/react'

import { API_HOST, getServerSideFetch } from '@src/api'
import { SubmissionContent } from '@src/components/Code'
import { PageContainer } from '@src/components/PageContainer'
import { Title, TitleLayout } from '@src/components/Title'
import { SubmissionWithSourceCode } from '@src/hooks/useSubmission'

interface SubmissionIdPageProps {
  submission: SubmissionWithSourceCode
}

export default function SubmissionPage(props: SubmissionIdPageProps) {
  const { submission } = props
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Submission #{submission.id} | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTasks}>
          ผลตรวจข้อ{' '}
          <Link
            variant="hidden"
            isExternal
            href={`${API_HOST}problem/doc/${submission?.problem.id}`}
          >
            {submission.problem.name}
          </Link>
        </Title>
      </TitleLayout>
      <SubmissionContent submission={submission} />
    </PageContainer>
  )
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  return getServerSideFetch<SubmissionIdPageProps>(context, async (api) => ({
    submission: await api.get(`submission/${id}`),
  }))
}
