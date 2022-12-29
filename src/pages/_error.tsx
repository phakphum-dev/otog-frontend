import { Center, Divider, Heading } from '@chakra-ui/layout'

export default function Error({ title = 'Page not found', statusCode = 404 }) {
  return (
    <Center flex={1}>
      <div className="flex gap-4 h-[50px]">
        <Heading size="lg">{statusCode}</Heading>
        <Divider orientation="vertical" />
        <div>{title}</div>
      </div>
    </Center>
  )
}

export { getServerSideCookies as getServerSideProps } from '@src/context/HttpClient'
