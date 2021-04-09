import { Stack } from '@chakra-ui/layout'
import { PageContainer } from '@src/components/PageContainer'
import { TaskCard } from '@src/components/TaskCard'
import { Title } from '@src/components/Title'
import { FaTrophy } from 'react-icons/fa'

import {
  ApiClient,
  getServerSideProps as getServerSideCookie,
} from '@src/utils/api'
import { GetServerSideProps } from 'next'
import nookies from 'nookies'
import { AxiosError } from 'axios'
import { Contest, useCurrentContest } from '@src/utils/api/Contest'
import { InitialDataProvider } from '@src/utils/hooks/useInitialData'
import { getErrorToast } from '@src/utils/error'

export interface ContestPageProps {
  initialData: Contest | null
}

export default function ContestPage(props: ContestPageProps) {
  const { initialData } = props
  return (
    <InitialDataProvider value={initialData}>
      <PageContainer dense>{initialData && <ContestTasks />}</PageContainer>
    </InitialDataProvider>
  )
}

function ContestTasks() {
  const { data: currentContest } = useCurrentContest()
  return currentContest ? (
    <>
      <Title icon={FaTrophy}>แข่งขัน</Title>
      <Stack spacing={6}>
        {currentContest.problems?.map((prob) => (
          <TaskCard
            contestId={currentContest.id}
            key={prob.id}
            problem={prob}
          />
        ))}
      </Stack>
    </>
  ) : null
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // console.log('before req', context.req.headers)
  // console.log('before res', context.res.getHeader('set-cookie'))
  const props = await getServerSideCookie(context)
  const client = new ApiClient(context)
  try {
    const initialData = await client.get<Contest | null>('contest/now')
    const { accessToken = null } = nookies.get(context)
    return {
      props: { initialData, accessToken, ...props },
    }
  } catch (e) {
    if (e.isAxiosError) {
      const error = e as AxiosError
      if (error.response?.status === 401) {
        const errorToast = getErrorToast(error)
        return {
          props: { accessToken: null, error: errorToast, ...props },
        }
      }

      if (error.response === undefined) {
        const errorToast = getErrorToast(error)
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
