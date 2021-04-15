import { GetServerSidePropsContext } from 'next'
import { parseCookies } from 'nookies'
import { ParsedUrlQuery } from 'querystring'

export interface ColorModeProps {
  colorModeCookie: string | null
}

export const getColorMode = (
  context: GetServerSidePropsContext<ParsedUrlQuery>
) => {
  const { 'chakra-ui-color-mode': colorModeCookie = null } = parseCookies(
    context
  )
  return colorModeCookie ? `chakra-ui-color-mode=${colorModeCookie}` : ''
}
