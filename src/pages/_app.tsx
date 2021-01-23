import { AppProps } from 'next/app'
import Head from 'next/head'

import { ChakraProvider, cookieStorageManager, Flex } from '@chakra-ui/react'
import { theme } from '@src/theme'
import 'focus-visible/dist/focus-visible'

import { NavBar } from '@src/components/Navbar'
// import '../styles/globals.css'

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
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ChakraProvider colorModeManager={colorModeManager} theme={theme}>
        <Flex direction="column" minH="100vh">
          <Flex direction="column" flex={1}>
            <NavBar />
            <Component {...pageProps} />
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
