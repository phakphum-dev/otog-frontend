import { AppProps } from 'next/app'
import Head from 'next/head'

import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '@src/theme'
import 'focus-visible/dist/focus-visible'
// import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>OTOG - </title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  )
}
