import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'
import { ParsedUrlQuery } from 'querystring'

export interface ColorModeProps {
  colorModeCookie: string | null
}

export const getColorMode = (
  context: GetServerSidePropsContext<ParsedUrlQuery>
) => {
  const { 'chakra-ui-color-mode': colorModeCookie = null } = nookies.get(
    context
  )
  return colorModeCookie
}
