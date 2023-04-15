import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// import GoogleProvider from 'next-auth/providers/google'
import { api } from '@src/api'
import { AuthRes } from '@src/user/types'

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    // }),
    CredentialsProvider({
      id: 'otog',
      name: 'OTOG',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          return await api.url('auth/login').post(credentials).json<AuthRes>()
        } catch (e: unknown) {
          console.error(e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // console.log('session', session, token)
      return { ...session, ...token }
    },
    async jwt({ token, user, account }) {
      // console.log('jwt', token, user, account)
      if (account?.provider === 'otog') {
        return { ...token, ...user }
      }
      return token
    },
  },
}

export default NextAuth(authOptions)

// export function getUserData(accessToken: string | null): User | null {
//   if (accessToken) {
//     const { id, username, showName, role, rating } = jwtDecode<
//       User & JwtPayload
//     >(accessToken)
//     return { id, username, showName, role, rating }
//   }
//   return null
// }
