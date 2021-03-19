import { AppProps } from 'next/app'
import Head from 'next/head'

import { ChakraProvider, cookieStorageManager, Flex } from '@chakra-ui/react'
import { theme } from '@src/theme'
import 'focus-visible/dist/focus-visible'

import { NavBar } from '@src/components/NavBar'
// import '../styles/globals.css'

import '@src/styles/nprogress.css'
import dynamic from 'next/dynamic'

import { InitialDataProvider } from '@src/utils/hooks/useInitialData'
import { HttpProvider } from '@src/utils/api/HttpProvider'

const TopProgressBar = dynamic(() => import('@src/components/ProgressBar'), {
  ssr: false,
})

export default function MyApp({ Component, pageProps }: AppProps) {
  const { colorModeCookie, initialData } = pageProps
  const colorModeManager =
    typeof colorModeCookie === 'string'
      ? cookieStorageManager(`chakra-ui-color-mode=${colorModeCookie}`)
      : undefined

  return (
    <>
      <Head>
        <title>OTOG - </title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/logo196.png" />
        <link rel="apple-touch-icon" href="/logoIOS.png" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <HttpProvider>
        <InitialDataProvider value={initialData}>
          <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
            <TopProgressBar />
            <Flex direction="column" minH="100vh">
              <Flex direction="column" flex={1}>
                <NavBar />
                <Component {...pageProps} />
              </Flex>
            </Flex>
          </ChakraProvider>
        </InitialDataProvider>
      </HttpProvider>
    </>
  )
}
