import { useSession } from 'next-auth/react'
import { ReactNode, useEffect, useMemo } from 'react'
import { SWRConfig } from 'swr'

import { client, setAccessToken, tokenStore } from '../api'

import { onErrorToast } from '@src/hooks/useErrorToast'
import { Session } from 'next-auth'

const fetcher = (url: string) => client.get(url).json()

export const SWRProvider = (props: {
  children: ReactNode
  fallback: { [key: string]: any }
  session: Session
}) => {
  const { children, fallback = {}, session: serverSession } = props
  const { update, data: session, status } = useSession()
  // this will run before render and only rerun when accessToken is updated on the server
  useMemo(() => {
    if (serverSession !== undefined) {
      const accessToken = serverSession && serverSession.accessToken
      if (session?.accessToken !== accessToken) {
        setAccessToken(accessToken)
        // console.log(
        //   'token change from serversideprops',
        //   session?.accessToken?.at(-1),
        //   accessToken?.at(-1)
        // )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSession])
  // this will run after revalidating session
  useMemo(() => {
    if (status === 'authenticated') {
      setAccessToken(session.accessToken)
      // console.log(
      //   'token change from session changed',
      //   session?.accessToken?.at(-1)
      // )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])
  // call update session to the server when accessToken is updated on the client
  useEffect(() => {
    if (session === null) return
    return tokenStore.subscribe(
      ({ accessToken }, { accessToken: prevAccessToken }) => {
        if (accessToken !== prevAccessToken) {
          update({ accessToken })
          // console.log('update token to', accessToken?.at(-1))
        }
      }
    )
  }, [update, session])
  return (
    <SWRConfig
      value={{
        fetcher,
        onError: onErrorToast,
        fallback,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </SWRConfig>
  )
}
