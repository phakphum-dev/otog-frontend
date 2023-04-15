import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { createContext, useCallback, useContext } from 'react'
import { ReactNode } from 'react'
import { useSWRConfig } from 'swr'

import { removeAccessToken } from './HttpClient'

import { User } from '@src/user/types'

export interface UserProviderProps {
  logout: () => void
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  clearCache: () => void
}

const UserContext = createContext({} as UserProviderProps)
export const useUserData = () => useContext(UserContext)
export const UserProvider = (props: { children: ReactNode }) => {
  const { children } = props

  const { data: session } = useSession()

  const user = session?.user ?? null

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'

  // SWR cache is Map by default
  const cache = useSWRConfig().cache as Map<string, any>
  const clearCache = useCallback(() => {
    cache.clear()
  }, [cache])
  const router = useRouter()
  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    await router.push('/login')
    removeAccessToken()
    clearCache()
  }, [router, clearCache])

  const value = { user, isAuthenticated, isAdmin, logout, clearCache }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
