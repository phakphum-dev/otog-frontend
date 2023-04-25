import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { ReactNode, useEffect, useMemo } from 'react'
import { SWRConfig } from 'swr'

import { client, setAccessToken, useTokenStore } from '../api'

import { onErrorToast } from '@src/hooks/useErrorToast'

const fetcher = (url: string) => client.get(url).json()

export const SWRProvider = (props: {
  children: ReactNode
  fallback: { [key: string]: any }
  session: Session
}) => {
  const { children, fallback = {}, session: pageSession } = props
  const { update, data: dataSession } = useSession()
  // this will run before render and only rerun when accessToken is updated on the server
  useMemo(() => {
    if (pageSession !== undefined) {
      const accessToken = pageSession && pageSession.accessToken
      setAccessToken(accessToken)
    }
  }, [pageSession])
  // call update session to the server when accessToken is updated on the client
  useEffect(() => {
    if (dataSession === null) return
    return useTokenStore.subscribe(({ accessToken }) => {
      update({ accessToken })
    })
  }, [update, dataSession])
  return (
    <SWRConfig value={{ fetcher, onError: onErrorToast, fallback }}>
      {children}
    </SWRConfig>
  )
}
