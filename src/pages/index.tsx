import NextLink from 'next/link'
import {
  Button,
  Center,
  Heading,
  HStack,
  Img,
  Stack,
  Text,
} from '@chakra-ui/react'
import { PageContainer } from '@src/components/PageContainer'
import { GetServerSideProps } from 'next'
import { getServerSideCookies } from '@src/utils/api'

export default function HomePage() {
  return (
    <PageContainer as={Center}>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={16}
        pb={{ base: 0, md: 16 }}
      >
        <Stack spacing={6} flex={1}>
          <Heading as="h1" size="2xl">
            Become a god of Competitive Programming
          </Heading>
          <Text color="gray.500" fontSize="md">
            Code and Create algorithms efficiently.
          </Text>
          <HStack spacing={4}>
            <NextLink href="/register">
              <Button variant="otog" width="100px">
                Sign Up
              </Button>
            </NextLink>
            <NextLink href="/login">
              <Button width="100px" variant="outline">
                Sign in
              </Button>
            </NextLink>
          </HStack>
        </Stack>
        <Center flex={1}>
          <Img src="/computer.svg" width="100%" />
        </Center>
      </Stack>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const serverSideCookies = getServerSideCookies(context)
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
