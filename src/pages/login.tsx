import { Box, Stack } from '@chakra-ui/layout'
import { Login, LoginModal } from '@src/components/LoginModal'
import { PageContainer } from '@src/components/PageContainer'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  return (
    <PageContainer>
      <Stack mt={16}>
        <Box boxShadow="md" borderRadius="md" p={4} mx="auto">
          <Login onSuccess={() => router.replace('/problem')} />
        </Box>
      </Stack>
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
