import { GetServerSideProps } from 'next'
import Image from 'next/image'
import NextLink from 'next/link'

import ComputerImage from '../../public/computer.svg'

import { Button, Center, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { PageContainer } from '@src/components/layout/PageContainer'
import { getServerSideCookies } from '@src/context/HttpClient'

export default function HomePage() {
  return (
    <PageContainer as={Center} maxSize="lg">
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
            <NextLink href="/register" passHref>
              <Button as="a" variant="otog" width="100px">
                Sign Up
              </Button>
            </NextLink>
            <NextLink href="/login" passHref>
              <Button as="a" width="100px" variant="outline">
                Sign in
              </Button>
            </NextLink>
          </HStack>
        </Stack>
        <Center flex={1}>
          <Image src={ComputerImage} />
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
