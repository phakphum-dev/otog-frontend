import NextLink from 'next/link'
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Img,
  Input,
  Stack,
} from '@chakra-ui/react'

export default function LoginPage() {
  return (
    <Container>
      <Stack align="center" mt={16}>
        <Img src="logo512.png" boxSize="100px" />
        <Box boxShadow="md" borderRadius="md" p={4}>
          <Stack spacing={4}>
            <Input type="username" placeholder="Username" />
            <Input type="password" placeholder="Password" />
            <Button colorScheme="orange" type="submit">
              เข้าสู่ระบบ
            </Button>
            <Divider />
            <NextLink href="/register">
              <Button>ลงทะเบียน</Button>
            </NextLink>
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}

export { getServerSideProps } from '@src/theme/ColorMode'
