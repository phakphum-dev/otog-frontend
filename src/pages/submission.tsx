import { FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { Flex, Stack } from '@chakra-ui/layout'
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
import { AxiosError } from 'axios'
import { GetServerSideProps } from 'next'
import nookies from 'nookies'
import { FaPuzzlePiece } from 'react-icons/fa'

export default function SubmissionPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const { isOpen: isOnlyMe, onToggle } = useDisclosure({
    defaultIsOpen: !isAdmin,
  })

  return (
    <PageContainer>
      <Title icon={FaPuzzlePiece}>ผลตรวจ</Title>
      <Stack
        mb={4}
        justify="space-between"
        align={{ base: 'flex-end', md: 'center' }}
        flexDir={{ base: 'column', md: 'row-reverse' }}
      >
        <LatestSubmission />
        {isAuthenticated && (
          <Flex alignItems="center" width="auto">
            <FormLabel htmlFor="only-me" mb="0">
              แสดงเฉพาะฉัน
            </FormLabel>
            <Switch
              colorScheme="orangeSwitch"
              isChecked={isOnlyMe}
              onChange={onToggle}
              id="only-me"
            />
          </Flex>
        )}
      </Stack>
      <SubmissionTable isOnlyMe={isOnlyMe} />
    </PageContainer>
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
      const { accessToken } = nookies.get(context)
      return {
        props: { initialData, accessToken, ...props },
      }
    }
  } catch (e) {
    if (e.isAxiosError) {
      const error = e as AxiosError
      // TODO: change to 403
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
