// import { JWT as NextAuthJWT } from 'next-auth/jwt'
import { AuthRes } from '@src/user/types'

declare module 'next-auth' {
  type User = AuthRes
  type Session = User
}

// declare module 'next-auth/jwt' {
//   type JWT = AuthRes
// }
