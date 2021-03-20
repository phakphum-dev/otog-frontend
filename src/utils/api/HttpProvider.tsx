import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { SWRConfig } from 'swr'
import { ApiClient } from '.'
import { useAuth } from './AuthProvider'

const HttpContext = createContext({} as ApiClient)
const useHttp = () => useContext(HttpContext)

function HttpProvider(props: PropsWithChildren<{}>) {
  const http = useMemo(() => new ApiClient(null), [])
  return (
    <SWRConfig value={{ fetcher: (url) => http.get(url).then((data) => data) }}>
      <HttpContext.Provider value={http} {...props} />
    </SWRConfig>
  )
}

export { HttpProvider, useHttp }
