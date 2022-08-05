import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { analytics } from '@src/analytics'

export const useAnalytics = () => {
  const router = useRouter()
  useEffect(() => {
    analytics.page(router.pathname)
  }, [router.pathname])
}
