export default function Error({ title = 'Page not found', statusCode = 404 }) {
  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="flex items-center gap-4 h-[50px]">
        <div className="font-bold text-3xl">{statusCode}</div>
        <hr className="h-full border-l" />
        <div>{title}</div>
      </div>
    </div>
  )
}

export { getServerSideCookies as getServerSideProps } from '@src/context/HttpClient'
