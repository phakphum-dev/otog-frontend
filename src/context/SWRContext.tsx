import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

import { http } from './HttpClient'

import { useErrorToast } from '@src/hooks/useErrorToast'

const fetcher = (url: string) => http.get(url).then((data) => data)

export const SWRProvider = (props: { children: ReactNode; fallback: any }) => {
  const { children, fallback = {} } = props
  const { onError } = useErrorToast()
  return (
    <SWRConfig value={{ fetcher, onError, fallback }}>{children}</SWRConfig>
  )
}
