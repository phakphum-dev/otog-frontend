import { Button } from '@chakra-ui/button'
import { HStack } from '@chakra-ui/layout'
import { UseToastOptions } from '@chakra-ui/toast'
import { LatestSubmission } from '@src/components/LatestSubmission'
import { PageContainer } from '@src/components/PageContainer'
import { SubmissionTable } from '@src/components/SubmissionTable'
import { Title } from '@src/components/Title'
import {
  ApiClient,
  getServerSideProps as getServerSideCookie,
} from '@src/utils/api'
import { SubmissionWithProblem } from '@src/utils/api/Submission'
import { InitialDataProvider } from '@src/utils/hooks/useInitialData'
import { AxiosError } from 'axios'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import nookies from 'nookies'
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
          <Link href="/submission/all">
            <Button>ผลตรวจรวม</Button>
          </Link>
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
  // console.log('before req', context.req.headers)
  // console.log('before res', context.res.getHeader('set-cookie'))
  const props = await getServerSideCookie(context)
  const client = new ApiClient(context)
  try {
    const { accessToken = null } = nookies.get(context)
    if (accessToken) {
      const initialData = await client.get<SubmissionWithProblem>(
        'submission/latest'
      )
      const { accessToken = null } = nookies.get(context)
      return {
        props: { initialData, accessToken, ...props },
      }
    } else {
      return {
        redirect: {
          permanent: false,
          destination: '/submission/all',
        },
      }
    }
  } catch (e) {
    if (e.isAxiosError) {
      const error = e as AxiosError
      if (error.response?.status === 401) {
        const errorToast: UseToastOptions = {
          title: 'เซสชันหมดอายุ',
          description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
          status: 'info',
          isClosable: true,
        }
        return {
          props: { accessToken: null, error: errorToast, ...props },
        }
      }

      if (error.response === undefined) {
        const errorToast: UseToastOptions = {
          title: 'เซิฟเวอร์ยังไม่เปิด',
          duration: null,
          status: 'error',
        }
        return {
          props: { error: errorToast, ...props },
        }
      }
    }
    console.log(e)
  } finally {
    // console.log('after req', context.req.headers)
    // console.log('after res', context.res.getHeader('set-cookie'))
  }

  return { props }
}
