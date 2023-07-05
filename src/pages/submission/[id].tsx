import Head from 'next/head'
import { useRouter } from 'next/router'
import { FaTasks } from 'react-icons/fa'

import {
  getSubmissionWithSourceCode,
  keySubmissionWithSourceCode,
  useSubmissionWithSourceCode,
} from '../../submission/queries'

import { withSession } from '@src/api/withSession'
import { SubmissionContent } from '@src/components/Code'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { API_HOST } from '@src/config'
import { Link } from '@src/ui/Link'

export default function SubmissionPage() {
  const router = useRouter()
  const id = Number(router.query.id)
  const { data: submission } = useSubmissionWithSourceCode(id)
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Submission #{submission!.id} | OTOG</title>
      </Head>
      <div className="mt-8 rounded-lg border p-6 shadow-md">
        <TitleLayout className="mt-0">
          <Title icon={<FaTasks />}>
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
      </div>
    </PageContainer>
  )
}
export const getServerSideProps = withSession(async (_, context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  const submission = getSubmissionWithSourceCode(id)
  return {
    props: {
      fallback: { [keySubmissionWithSourceCode(id)]: await submission },
    },
  }
})
