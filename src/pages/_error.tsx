import { NextPageContext } from 'next'

const ErrorPage = ({ title = 'Internal server error', statusCode = 500 }) => {
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

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage
