import { Center, Divider } from '@chakra-ui/layout'

export default function Error({ title = 'Page not found', statusCode = 404 }) {
  return (
    <Center flex={1}>
      <div className="flex items-center gap-4 h-[50px]">
        <div className="font-bold text-3xl">{statusCode}</div>
        <Divider orientation="vertical" />
        <div>{title}</div>
      </div>
    </Center>
  )
}

export { getServerSideCookies as getServerSideProps } from '@src/context/HttpClient'
