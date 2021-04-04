import { FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import Icon from '@chakra-ui/icon'
import { HStack } from '@chakra-ui/layout'
import { Switch } from '@chakra-ui/switch'
import { UseToastOptions } from '@chakra-ui/toast'
import { LatestSubmission } from '@src/components/LatestSubmission'
import { PageContainer } from '@src/components/PageContainer'
import { SubmissionTable } from '@src/components/SubmissionTable'
import { Title } from '@src/components/Title'
import {
  ApiClient,
  getServerSideProps as getServerSideCookie,
} from '@src/utils/api'
import { useAuth } from '@src/utils/api/AuthProvider'
import { SubmissionDto } from '@src/utils/api/Submission'
import { InitialDataProvider } from '@src/utils/hooks/useInitialData'
import { AxiosError } from 'axios'
import { GetServerSideProps } from 'next'
import nookies from 'nookies'
import { FaTasks, FaUser, FaUsers } from 'react-icons/fa'

interface SubmissionPageProps {
  initialData: SubmissionDto
}

export default function SubmissionPage(props: SubmissionPageProps) {
  const { initialData } = props
  const { isAuthenticated, isAdmin } = useAuth()
  const { isOpen: isOnlyMe, onToggle } = useDisclosure({
    defaultIsOpen: !isAdmin,
  })

  return (
    <InitialDataProvider value={initialData}>
      <PageContainer>
        <Title icon={FaTasks}>ผลตรวจ</Title>
        <HStack mb={4} justify="space-between" spacing={2}>
          <LatestSubmission isOnlyMe={isOnlyMe} />
          {isAuthenticated && (
            <HStack alignItems="center" width="auto" color="gray.500">
              <FormLabel htmlFor="only-me" mb={0}>
                <Icon as={FaUsers} boxSize="1.5rem" />
              </FormLabel>
              <Switch
                mr={2}
                colorScheme="gray"
                isChecked={isOnlyMe}
                onChange={onToggle}
                id="only-me"
              />
              <FormLabel htmlFor="only-me" mb={0}>
                <Icon as={FaUser} boxSize="1.25rem" mr={0} />
              </FormLabel>
            </HStack>
          )}
        </HStack>
        <SubmissionTable isOnlyMe={isOnlyMe} />
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
      const initialData = await client.get<SubmissionDto>('submission/latest')
      const { accessToken = null } = nookies.get(context)
      return {
        props: { initialData, accessToken, ...props },
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
