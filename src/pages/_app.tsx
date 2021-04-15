import { AppProps } from 'next/app'
import Head from 'next/head'

import {
  ChakraProvider,
  cookieStorageManager,
  Flex,
  localStorageManager,
  UseToastOptions,
} from '@chakra-ui/react'
import { theme } from '@src/theme'
import 'focus-visible/dist/focus-visible'

import { NavBar } from '@src/components/NavBar'
import { Footer } from '@src/components/Footer'
import '../styles/globals.css'

import '@src/styles/nprogress.css'
import dynamic from 'next/dynamic'

import { HttpProvider } from '@src/utils/api/HttpProvider'
import { AuthProvider } from '@src/utils/api/AuthProvider'

import { useEffect } from 'react'
import { errorToast as toast } from '@src/utils/hooks/useError'
import Error from 'next/error'

const TopProgressBar = dynamic(() => import('@src/components/ProgressBar'), {
  ssr: false,
})

export default function MyApp({ Component, pageProps }: AppProps) {
  const { colorModeCookie, accessToken, errorToast, ...props } = pageProps

  useEffect(() => {
    if (errorToast) {
      toast(errorToast as UseToastOptions)
    }
  }, [errorToast])

  return (
    <>
      <Head>
        <title>One Tambon One Grader | OTOG</title>
        <meta
          name="description"
          content="Become a god of competitive programming. Code and create algorithms efficiently."
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo196.png" type="image/png" />
        <link rel="shortcut icon" href="/logo196.png" />
        <link rel="apple-touch-icon" href="/logoIOS.png" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ChakraProvider
        theme={theme}
        colorModeManager={cookieStorageManager(colorModeCookie as string)}
      >
        <HttpProvider>
          <AuthProvider value={accessToken as string}>
            <TopProgressBar />
            <Flex direction="column" minH="100vh">
              <NavBar />
              {errorToast ? (
                <Error statusCode={404} title="Not found" />
              ) : (
                <Component {...props} />
              )}
              <Footer />
            </Flex>
          </AuthProvider>
        </HttpProvider>
      </ChakraProvider>
    </>
  )
}
