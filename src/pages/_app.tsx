import { loader } from '@monaco-editor/react'
import 'focus-visible/dist/focus-visible'
import { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import '../styles/globals.css'

import { ChakraProvider } from '@chakra-ui/provider'
import { Flex, cookieStorageManager } from '@chakra-ui/react'

import { Chat } from '@src/chat'
import { ErrorToaster } from '@src/components/ErrorToaster'
import { Footer } from '@src/components/layout/Footer'
import { NavBar } from '@src/components/layout/NavBar'
import { OFFLINE_MODE } from '@src/config'
import { AuthProvider } from '@src/context/AuthContext'
import { ConfirmModalProvider } from '@src/context/ConfirmContext'
import { SWRProvider } from '@src/context/SWRContext'
import { SocketProvider } from '@src/context/SocketContext'
import { useAnalytics } from '@src/hooks/useAnalytics'
import '@src/styles/nprogress.css'
import { theme } from '@src/theme'

const TopProgressBar = dynamic(
  () => import('@src/components/layout/ProgressBar'),
  {
    ssr: false,
  }
)

if (OFFLINE_MODE) {
  loader.config({
    paths: {
      vs: '/vs',
    },
  })
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const {
    colorModeCookie,
    accessToken,
    errorToast,
    fallback,
    ...props
  } = pageProps
  useAnalytics()
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
        <ConfirmModalProvider>
          <SWRProvider fallback={fallback}>
            <AuthProvider value={accessToken as string}>
              <SocketProvider>
                <TopProgressBar />
                <Flex direction="column" minH="100vh">
                  <NavBar />
                  <Component {...props} />
                  <ErrorToaster errorToast={errorToast} />
                  {!OFFLINE_MODE && <Chat />}
                  <Footer />
                </Flex>
              </SocketProvider>
            </AuthProvider>
          </SWRProvider>
        </ConfirmModalProvider>
      </ChakraProvider>
    </>
  )
}
