import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import { Session, getServerSession } from 'next-auth'
import { ParsedUrlQuery } from 'querystring'

import { setAccessToken } from '@src/api'
import { authOptions } from '@src/pages/api/auth/[...nextauth]'

export function withSession<
  P extends { [key: string]: any },
  T extends GetServerSidePropsResult<P> = GetServerSidePropsResult<P>
>(
  callback: (session: Session | null, context: Context) => Promise<T>
): GetServerSideProps<P> {
  return async (context) => {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    )
    // console.log('with session', session?.user.username)
    if (session) {
      setAccessToken(session.accessToken)
    }
    const result = await callback(session, context)
    if ('props' in result) {
      return { props: { ...result.props, session } }
    }
    return result
  }
}

export type Context = GetServerSidePropsContext<ParsedUrlQuery>
