import { useSession } from 'next-auth/react'
import { ReactNode, useMemo } from 'react'
import { SWRConfig } from 'swr'

import { api, setAccessToken } from '../api'

import { onErrorToast } from '@src/hooks/useErrorToast'

const fetcher = (url: string) => api.get(url).json()

export const SWRProvider = (props: {
  children: ReactNode
  fallback: { [key: string]: any }
}) => {
  const { children, fallback = {} } = props
  const { data: session } = useSession()
  // this will run before render and only rerun when session change
  useMemo(() => {
    console.log('set new token')
    setAccessToken(session?.accessToken ?? null)
  }, [session?.accessToken])
  return (
    <SWRConfig value={{ fetcher, onError: onErrorToast, fallback }}>
      {children}
    </SWRConfig>
  )
}
