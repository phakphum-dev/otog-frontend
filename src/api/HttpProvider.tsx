import {
  ProviderProps,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { SWRConfig } from 'swr'

import { ApiClient } from '.'
import { ErrorToastOptions } from '../hooks/useError'

import { useToast } from '@chakra-ui/toast'

const HttpContext = createContext({} as ApiClient)
export const useHttp = () => useContext(HttpContext)

export const HttpProvider = (props: ProviderProps<ErrorToastOptions>) => {
  // server side api error handling and displays
  const { value: errorToast, children } = props
  const toast = useToast()
  useEffect(() => {
    if (errorToast) {
      toast(errorToast)
    }
  }, [errorToast, toast])

  const http = useMemo(() => new ApiClient(null), [])
  return (
    <SWRConfig value={{ fetcher: (url) => http.get(url).then((data) => data) }}>
      <HttpContext.Provider value={http}>{children}</HttpContext.Provider>
    </SWRConfig>
  )
}
