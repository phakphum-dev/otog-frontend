import {
  createContext,
  ProviderProps,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useHttp } from './HttpProvider'
import jwtDecode, { JwtPayload } from 'jwt-decode'

import { LoginModal } from '@src/components/Login'
import { useDisclosure, useForceUpdate } from '@chakra-ui/hooks'
import { useRouter } from 'next/router'
import { AuthRes, LoginReq, User } from '@src/hooks/useUser'
import { cache } from 'swr'
import { useProfilePic } from '@src/hooks/useProfilePic'

export interface AuthProviderProps {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  profileSrc: string | undefined
  refreshProfilePic: () => Promise<void>
  login: (credentials: LoginReq) => Promise<void>
  logout: () => void
  refresh: () => void
}

export type AuthValueProps = ProviderProps<string | null>

export function getUserData(accessToken: string | null): User | null {
  if (accessToken) {
    const { id, username, showName, role, rating } = jwtDecode<
      User & JwtPayload
    >(accessToken)
    return { id, username, showName, role, rating }
  }
  return null
}

const AuthContext = createContext({} as AuthProviderProps)
export const useAuth = () => useContext(AuthContext)
export const AuthProvider = (props: AuthValueProps) => {
  const { value: accessToken, children } = props

  const user = getUserData(accessToken)
  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'

  const forceUpdate = useForceUpdate()

  const http = useHttp()
  const login = async (credentials: LoginReq) => {
    const { accessToken } = await http.post<AuthRes>(`auth/login`, credentials)
    http.setNewToken(accessToken)
    cache.clear()
  }

  const router = useRouter()
  const logout = () => {
    http.removeToken()
    cache.clear()
    router.push('/login')
  }

  const loginModal = useDisclosure()

  const { url, fetchUrl } = useProfilePic(user?.id, { auto: false })
  useEffect(() => {
    fetchUrl()
  }, [isAuthenticated])

  useEffect(() => {
    http.openLoginModal = loginModal.onOpen
    http.updateOnLogout = forceUpdate
  }, [http])

  const value = {
    login,
    logout,
    user,
    isAuthenticated,
    isAdmin,
    profileSrc: url,
    refreshProfilePic: fetchUrl,
    refresh: forceUpdate,
  }

  return (
    <AuthContext.Provider value={value}>
      <LoginModal {...loginModal} />
      {children}
    </AuthContext.Provider>
  )
}
