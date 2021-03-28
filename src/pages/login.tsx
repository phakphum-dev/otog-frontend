import { Box, Stack } from '@chakra-ui/layout'
import { LoginForm } from '@src/components/LoginModal'
import { PageContainer } from '@src/components/PageContainer'
import { useRouter } from 'next/router'
import { getServerSideProps as getServerSideCookies } from '@src/utils/api'
import { GetServerSideProps } from 'next'

export default function LoginPage() {
  const router = useRouter()
  return (
    <PageContainer>
      <Stack mt={16}>
        <Box boxShadow="md" borderRadius="md" p={4} mx="auto">
          <LoginForm onSuccess={() => router.replace('/problem')} />
        </Box>
      </Stack>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const serverSideCookies = await getServerSideCookies(context)
  if (serverSideCookies.props.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/problem',
      },
    }
  }
  return serverSideCookies
}
