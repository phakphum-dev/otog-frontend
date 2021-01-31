import NextLink from 'next/link'
import {
  Box,
  Button,
  Container,
  Divider,
  Img,
  Input,
  Stack,
} from '@chakra-ui/react'
import { OrangeButton } from '@src/components/OrangeButton'

export default function LoginPage() {
  return (
    <Container>
      <Stack align="center" mt={16}>
        <Img src="logo512.png" boxSize="100px" />
        <Box boxShadow="md" borderRadius="md" p={4}>
          <Stack spacing={4}>
            <Input type="username" placeholder="ชื่อผู้ใช้" />
            <Input type="password" placeholder="รหัสผ่าน" />
            <OrangeButton type="submit">เข้าสู่ระบบ</OrangeButton>
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
