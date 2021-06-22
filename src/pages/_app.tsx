import { AppProps } from 'next/app'
import Head from 'next/head'

import { ChakraProvider, cookieStorageManager, Flex } from '@chakra-ui/react'
import { theme } from '@src/theme'
import 'focus-visible/dist/focus-visible'

import { NavBar } from '@src/components/NavBar'
import { Footer } from '@src/components/Footer'
import '../styles/globals.css'

import '@src/styles/nprogress.css'
import dynamic from 'next/dynamic'

import { HttpProvider } from '@src/api/HttpProvider'
import { AuthProvider } from '@src/api/AuthProvider'
import { SocketProvider } from '@src/api/SocketProvider'
import { ConfirmModalProvider } from '@src/components/ConfirmModal'

import { ErrorToastOptions } from '@src/hooks/useError'
import { Chat } from '@src/components/Chat'
import Error from './_error'

const TopProgressBar = dynamic(() => import('@src/components/ProgressBar'), {
  ssr: false,
})

export default function MyApp({ Component, pageProps }: AppProps) {
  const { colorModeCookie, accessToken, errorToast, ...props } = pageProps

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
          <HttpProvider value={errorToast as ErrorToastOptions}>
            <AuthProvider value={accessToken as string}>
              <SocketProvider>
                <TopProgressBar />
                <Flex direction="column" minH="100vh">
                  <NavBar />
                  {errorToast ? (
                    <Error
                      title={errorToast.title}
                      statusCode={errorToast.code}
                    />
                  ) : (
                    <Component {...props} />
                  )}
                  <Chat />
                  <Footer />
                </Flex>
              </SocketProvider>
            </AuthProvider>
          </HttpProvider>
        </ConfirmModalProvider>
      </ChakraProvider>
    </>
  )
}
