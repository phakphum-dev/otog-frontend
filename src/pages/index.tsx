import NextLink from 'next/link'
import { Center, Heading, Img, Stack, Text } from '@chakra-ui/react'
import { OrangeButton } from '@src/components/OrangeButton'
import { PageContainer } from '@src/components/PageContainer'

export default function HomePage() {
  return (
    <PageContainer>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={16}
        mt={{ base: 16, md: 32 }}
      >
        <Stack spacing={6} flex={1}>
          <Heading as="h1" size="2xl">
            Become a god of Competitive Programming
          </Heading>
          <Text color="gray.500" fontSize="md">
            Code and Create algorithms efficiently.
          </Text>
          <NextLink href="/register">
            <OrangeButton width="150px">{'Sign Up'}</OrangeButton>
          </NextLink>
        </Stack>
        <Center flex={1}>
          <Img src="/computer.svg" width="100%" />
        </Center>
      </Stack>
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/theme/ColorMode'
