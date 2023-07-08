import Head from 'next/head'
import NextLink from 'next/link'
import { FaTasks } from 'react-icons/fa'

import { withSession } from '@src/api/withSession'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useUserData } from '@src/context/UserContext'
import { AllSubmissionTable } from '@src/submission/SubmissionTable'
import { Button } from '@src/ui/Button'

export default function SubmissionPage() {
  const { isAuthenticated } = useUserData()
  return (
    <PageContainer>
      <Head>
        <title>Submission | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={<FaTasks />}>ผลตรวจรวม</Title>
        {isAuthenticated && (
          <NextLink passHref legacyBehavior href="/submission">
            <Button>ผลตรวจของคุณ</Button>
          </NextLink>
        )}
      </TitleLayout>
      <AllSubmissionTable />
    </PageContainer>
  )
}

export const getServerSideProps = withSession(() => ({ props: {} }))
