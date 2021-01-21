import {
  ChakraProvider,
  cookieStorageManager,
  localStorageManager,
  Wrap,
} from '@chakra-ui/react'
import { GetServerSideProps, NextPage } from 'next'

// for flashing ssr fix

interface PageProps {
  cookies: string
}

export const withColorMode = (WrappedPage: React.FC): NextPage<PageProps> => {
  return ({ cookies }) => {
    const colorModeManager =
      typeof cookies === 'string'
        ? cookieStorageManager(cookies)
        : localStorageManager
    return (
      <ChakraProvider colorModeManager={colorModeManager}>
        <WrappedPage />
      </ChakraProvider>
    )
  }
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  return {
    props: {
      cookies: req.headers.cookie ?? '',
    },
  }
}
