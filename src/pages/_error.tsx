export default function Error({ title = 'Page not found', statusCode = 404 }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex h-[50px] items-center gap-4">
        <div className="text-3xl font-bold">{statusCode}</div>
        <hr className="h-full border-l" />
        <div>{title}</div>
      </div>
    </div>
  )
}

export { getServerSideCookies as getServerSideProps } from '@src/context/HttpClient'
