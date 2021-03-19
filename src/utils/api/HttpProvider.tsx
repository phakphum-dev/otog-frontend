import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { SWRConfig } from 'swr'
import { ApiClient } from '.'

type HttpConstruct = {
  http: ApiClient
}

const HttpContext = createContext({} as HttpConstruct)
const useHttp = () => useContext(HttpContext)

function HttpProvider(props: PropsWithChildren<{}>) {
  const client = useMemo(() => new ApiClient(null), [])
  return (
    <SWRConfig value={{ fetcher: client.get }}>
      <HttpContext.Provider value={{ http: client }} {...props} />
    </SWRConfig>
  )
}

export { HttpProvider, useHttp }
