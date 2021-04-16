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
import { storage } from '@src/utils/firebase'
import { useRouter } from 'next/router'
import { AuthRes, LoginReq, User } from './User'
import { cache } from 'swr'

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
const useAuth = () => useContext(AuthContext)
const AuthProvider = (props: AuthValueProps) => {
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

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [profileSrc, setProfileSrc] = useState<string>()
  const getProfilePic = async () => {
    if (user) {
      try {
        const url = await storage
          .ref('images')
          .child(`${user.id}.png`)
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
  }, [isAuthenticated])

  useEffect(() => {
    http.openLoginModal = onOpen
    http.refresh = forceUpdate
  }, [http])

  const value = {
    login,
    logout,
    user,
    isAuthenticated,
    isAdmin,
    profileSrc,
    refreshProfilePic: getProfilePic,
    refresh: forceUpdate,
  }

  return (
    <AuthContext.Provider value={value}>
      <LoginModal isOpen={isOpen} onClose={onClose} />
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, useAuth }
