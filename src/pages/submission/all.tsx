import { Button } from '@chakra-ui/button'
import { HStack } from '@chakra-ui/layout'
import { PageContainer } from '@src/components/PageContainer'
import { AllSubmissionTable } from '@src/components/SubmissionTable'
import { Title } from '@src/components/Title'
import { useAuth } from '@src/utils/api/AuthProvider'
import Head from 'next/head'
import Link from 'next/link'
import { FaTasks } from 'react-icons/fa'

export default function SubmissionPage() {
  const { isAuthenticated } = useAuth()
  return (
    <PageContainer>
      <Head>
        <title>Submission | OTOG</title>
      </Head>
      <HStack justify="space-between">
        <Title icon={FaTasks}>ผลตรวจรวม</Title>
        {isAuthenticated && (
          <Link href="/submission">
            <Button>ผลตรวจของคุณ</Button>
          </Link>
        )}
      </HStack>
      <AllSubmissionTable />
    </PageContainer>
  )
}

export { getServerSideCookies as getServerSideProps } from '@src/utils/api'
