import { AppProps } from 'next/app'
import Head from 'next/head'

import {
  ChakraProvider,
  cookieStorageManager,
  Flex,
  UseToastOptions,
} from '@chakra-ui/react'
import { theme } from '@src/theme'
import 'focus-visible/dist/focus-visible'

import { NavBar } from '@src/components/NavBar'
// import '../styles/globals.css'

import '@src/styles/nprogress.css'
import dynamic from 'next/dynamic'

import { HttpProvider } from '@src/utils/api/HttpProvider'
import { AuthProvider } from '@src/utils/api/AuthProvider'

import { useEffect } from 'react'
import { errorToast } from '@src/utils/hooks/useError'

const TopProgressBar = dynamic(() => import('@src/components/ProgressBar'), {
  ssr: false,
})

export default function MyApp({ Component, pageProps }: AppProps) {
  const { colorModeCookie, accessToken, error, ...props } = pageProps

  const colorModeManager =
    typeof colorModeCookie === 'string'
      ? cookieStorageManager(`chakra-ui-color-mode=${colorModeCookie}`)
      : undefined

  useEffect(() => {
    if (error) errorToast(error as UseToastOptions)
  }, [error])

  return (
    <>
      <Head>
        <title>OTOG - </title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo196.png" type="image/png" />
        <link rel="shortcut icon" href="/logo196.png" />
        <link rel="apple-touch-icon" href="/logoIOS.png" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
        <HttpProvider>
          <AuthProvider value={accessToken as string}>
            <TopProgressBar />
            <Flex direction="column" minH="100vh">
              <Flex direction="column" flex={1}>
                <NavBar />
                <Component {...props} />
              </Flex>
            </Flex>
          </AuthProvider>
        </HttpProvider>
      </ChakraProvider>
    </>
  )
}
