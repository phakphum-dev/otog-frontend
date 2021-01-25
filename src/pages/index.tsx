import {
  Button,
  Center,
  Container,
  Heading,
  Img,
  Stack,
  Text,
} from '@chakra-ui/react'

export default function HomePage() {
  return (
    <Container>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={16} mt={16}>
        <Stack spacing={6} flex={1}>
          <Heading as="h1" size="2xl">
            Become a god of Competitive Programming
          </Heading>
          <Text color="gray.500" fontSize="md">
            Code and Create algorithms efficiently.
          </Text>
          <Button width="150px">{'>_ Sign Up'}</Button>
        </Stack>
        <Center flex={1}>
          <Img src="/computer.svg" width="100%" />
        </Center>
      </Stack>
    </Container>
  )
}

export { getServerSideProps } from '@src/theme/ColorMode'
