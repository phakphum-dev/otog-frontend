import {
  createContext,
  ProviderProps,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import nookies from 'nookies'
import { useHttp } from './HttpProvider'
import jwtDecode, { JwtPayload } from 'jwt-decode'

import { LoginModal } from '@src/components/LoginModal'
import { useDisclosure } from '@chakra-ui/hooks'
import { storage } from '@src/utils/firebase'
import { useRouter } from 'next/router'
import { Role } from './User'

export interface LoginReq {
  username: string
  password: string
}

export interface UserAuth {
  id: number
  username: string
  showName: string
  role: Role
  rating: number
}

export interface AuthRes {
  user: UserAuth
  accessToken: string
}

export interface AuthProviderProps {
  user: UserAuth | null
  isAuthenticated: boolean
  isAdmin: boolean
  profileSrc: string | undefined
  refreshProfilePic: () => Promise<void>
  login: (credentials: LoginReq) => Promise<void>
  logout: () => Promise<void>
}

export type AuthValueProps = ProviderProps<string | null>

export function getUserData(accessToken: string | null): UserAuth | null {
  if (accessToken) {
    const { id, username, showName, role, rating } = jwtDecode<
      UserAuth & JwtPayload
    >(accessToken)
    return { id, username, showName, role, rating }
  }
  return null
}

const AuthContext = createContext({} as AuthProviderProps)
const useAuth = () => useContext(AuthContext)
const AuthProvider = (props: AuthValueProps) => {
  const { value: accessToken, children } = props
  const [token, setToken] = useState(accessToken)
  useEffect(() => {
    setToken(accessToken)
  }, [accessToken])

  const user = useMemo(() => getUserData(token), [token])
  const isAuthenticated = !!token
  const isAdmin = user?.role === 'admin'

  const http = useHttp()
  const login = async (credentials: LoginReq) => {
    const { accessToken } = await http.post<LoginReq, AuthRes>(
      `auth/login`,
      credentials
    )
    setToken(accessToken)
    nookies.set(null, 'accessToken', accessToken, { path: '/' })
  }

  const removeToken = () => {
    setToken(null)
    nookies.destroy(null, 'accessToken')
  }

  const router = useRouter()
  const logout = async () => {
    await removeToken()
    router.push('/login')
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  const onSessionEnd = () => {
    removeToken()
    onOpen()
  }

  const refreshToken = (newToken: string) => {
    setToken(newToken)
    nookies.set(null, 'accessToken', newToken, { path: '/' })
  }

  const [profileSrc, setProfileSrc] = useState<string>()
  const getProfilePic = async () => {
    if (user) {
      try {
        const url = await storage
          .ref('images')
          .child(`${user.id}`)
          .getDownloadURL()
        setProfileSrc(url)
      } catch (error) {
        if (error.code === 'storage/object-not-found') {
          setProfileSrc(undefined)
        }
      }
    }
  }
  useEffect(() => {
    getProfilePic()
  }, [user])

  useEffect(() => {
    http.onRefreshToken = refreshToken
    http.removeToken = removeToken
    http.onSessionEnd = onSessionEnd
  }, [http])

  const value = {
    login,
    logout,
    user,
    isAuthenticated,
    isAdmin,
    profileSrc,
    refreshProfilePic: getProfilePic,
  }

  return (
    <AuthContext.Provider value={value}>
      <LoginModal isOpen={isOpen} onClose={onClose} />
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, useAuth }
