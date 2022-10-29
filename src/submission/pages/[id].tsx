import Head from 'next/head'
import { useRouter } from 'next/router'
import { FaTasks } from 'react-icons/fa'

import { getSubmission, keySubmission, useSubmission } from '../queries'

import { Link } from '@chakra-ui/react'

import { SubmissionContent } from '@src/components/Code'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { API_HOST } from '@src/config'
import { withCookies } from '@src/context/HttpClient'

export default function SubmissionPage() {
  const router = useRouter()
  const id = Number(router.query.id)
  const { data: submission } = useSubmission(id)
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Submission #{submission!.id} | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTasks}>
          ผลตรวจข้อ{' '}
          <Link
            variant="hidden"
            isExternal
            href={`${API_HOST}problem/doc/${submission?.problem.id}`}
          >
            {submission!.problem.name}
          </Link>
        </Title>
      </TitleLayout>
      <SubmissionContent submission={submission} />
    </PageContainer>
  )
}
export const getServerSideProps = withCookies(async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  const submission = getSubmission(id)
  return { props: { fallback: { [keySubmission(id)]: await submission } } }
})
