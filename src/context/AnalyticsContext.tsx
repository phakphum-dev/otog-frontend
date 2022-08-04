import { AnalyticsBrowser } from '@segment/analytics-next'
import { useRouter } from 'next/router'
import { ReactNode, createContext, useContext, useEffect, useMemo } from 'react'

const AnalyticsContext = createContext<AnalyticsBrowser>({} as AnalyticsBrowser)

type Props = {
  apiKey: string
  children: ReactNode
}
export const AnalyticsProvider = ({ children, apiKey }: Props) => {
  const router = useRouter()
  const analytics = useMemo(() => AnalyticsBrowser.load({ writeKey: apiKey }), [
    apiKey,
  ])

  useEffect(() => {
    analytics.page(router.pathname)
  }, [analytics, router.pathname])

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  return useContext(AnalyticsContext)
}
