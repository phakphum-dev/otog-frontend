import { AppProps } from 'next/app'
import Head from 'next/head'

import { ChakraProvider, cookieStorageManager, Flex } from '@chakra-ui/react'
import { theme } from '@src/theme'
import 'focus-visible/dist/focus-visible'

import { NavBar } from '@src/components/NavBar'
// import '../styles/globals.css'

import { SWRConfig } from 'swr'
import { get } from '@src/utils/api'

export default function MyApp({ Component, pageProps }: AppProps) {
  const { colorModeCookie } = pageProps
  const colorModeManager =
    typeof colorModeCookie === 'string'
      ? cookieStorageManager(colorModeCookie)
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
      <SWRConfig value={{ fetcher: get }}>
        <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
          <Flex direction="column" minH="100vh">
            <Flex direction="column" flex={1}>
              <NavBar />
              <Component {...pageProps} />
            </Flex>
          </Flex>
        </ChakraProvider>
      </SWRConfig>
    </>
  )
}
