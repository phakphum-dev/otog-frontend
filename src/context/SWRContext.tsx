import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

import { http } from './HttpClient'

import { onErrorToast } from '@src/hooks/useErrorToast'

const fetcher = (url: string) => http.get(url).then((data) => data)

export const SWRProvider = (props: { children: ReactNode; fallback: any }) => {
  const { children, fallback = {} } = props
  return (
    <SWRConfig value={{ fetcher, onError: onErrorToast, fallback }}>
      {children}
    </SWRConfig>
  )
}
