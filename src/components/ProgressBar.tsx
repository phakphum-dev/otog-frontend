import NProgress from 'nprogress'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const EXPECT_LOAD_TIME = 5
const UPDATE_FREQUENCY = 350
const FREEZE_PERSENT = 80

const ProgressBar: React.FC = () => {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const setOnLoading = () => {
      setLoading(true)
    }
    const setNotLoading = () => {
      setLoading(false)
    }

    router.events.on('routeChangeStart', setOnLoading)
    router.events.on('routeChangeComplete', setNotLoading)
    router.events.on('routeChangeError', setNotLoading)

    return () => {
      router.events.off('routeChangeStart', setOnLoading)
      router.events.off('routeChangeComplete', setNotLoading)
      router.events.off('routeChangeError', setNotLoading)
    }
  }, [router])

  useEffect(() => {
    if (loading) {
      //   NProgress.start()
      //   let n = 0
      //   const interval = setInterval(() => {
      //     n += 1
      //     NProgress.set((n * UPDATE_FREQUENCY) / (EXPECT_LOAD_TIME * 1000))
      //   }, UPDATE_FREQUENCY)
      const timeout = setTimeout(() => NProgress.start(), 100)
      return () => {
        // clearInterval(interval)
        clearTimeout(timeout)
        NProgress.done()
      }
    }
  }, [loading])

  return null
}

export default ProgressBar
