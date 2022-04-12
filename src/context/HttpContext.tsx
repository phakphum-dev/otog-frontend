import { ReactNode, createContext, useContext } from 'react'
import { SWRConfig } from 'swr'

import { HttpClient } from './HttpClient'

export const http = new HttpClient(null)
const HttpContext = createContext({} as HttpClient)
export const useHttp = () => useContext(HttpContext)

export const HttpProvider = (props: { children: ReactNode }) => {
  const { children } = props
  return (
    <SWRConfig value={{ fetcher: (url) => http.get(url).then((data) => data) }}>
      <HttpContext.Provider value={http}>{children}</HttpContext.Provider>
    </SWRConfig>
  )
}
