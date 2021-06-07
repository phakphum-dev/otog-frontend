import { Center, Divider, Heading, HStack, Text } from '@chakra-ui/layout'

export default function Error({ title = 'Page not found', statusCode = 404 }) {
  return (
    <Center flex={1}>
      <HStack height={50} spacing={4}>
        <Heading size="lg">{statusCode}</Heading>
        <Divider orientation="vertical" />
        <Text>{title}</Text>
      </HStack>
    </Center>
  )
}

export { getServerSideCookies as getServerSideProps } from '@src/utils/api'
