import { GetServerSideProps } from 'next'
import nookies from 'nookies'
// for flashing ssr fix

export const getServerSideColorMode: GetServerSideProps<{
  colorModeCookie: string | null
}> = async (context) => {
  const { 'chakra-ui-color-mode': colorModeCookie = null } = nookies.get(
    context
  )
  return { props: { colorModeCookie } }
}
