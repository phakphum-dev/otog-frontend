import {
  createContext,
  ProviderProps,
  useContext,
  useEffect,
  useState,
} from 'react'
import nookies from 'nookies'
import { useHttp } from './HttpProvider'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { useRouter } from 'next/router'

export interface LoginReqDTO {
  username: string
  password: string
}

export interface UserAuthDTO {
  id: number
  username: string
  showName: string
  role: string
  rating: number
}

export interface AuthResDTO {
  user: UserAuthDTO
  accessToken: string
}

export interface AuthProviderProps {
  user: UserAuthDTO | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credentials: LoginReqDTO) => Promise<void>
  logout: () => Promise<void>
}

export type AuthValueProps = ProviderProps<string | null>

export function getUserData(accessToken: string | null): UserAuthDTO | null {
  if (accessToken) {
    const { id, username, showName, role, rating } = jwtDecode<
      UserAuthDTO & JwtPayload
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

  const user = getUserData(token)
  const isAuthenticated = !!token
  const isAdmin = user?.role === 'admin'

  const http = useHttp()
  const login = async (credentials: LoginReqDTO) => {
    const { accessToken } = await http.post<LoginReqDTO, AuthResDTO>(
      `auth/login`,
      credentials
    )
    setToken(accessToken)
    nookies.set(null, 'accessToken', accessToken)
  }

  const router = useRouter()
  const logout = async () => {
    router.push('/login')
    setToken(null)
    nookies.destroy(null, 'accessToken')
  }

  const refreshToken = (newToken: string) => {
    setToken(newToken)
    nookies.set(null, 'accessToken', newToken)
  }

  useEffect(() => {
    http.onLogout = logout
    http.onRefreshToken = refreshToken
  }, [http])

  const value = { login, logout, user, isAuthenticated, isAdmin }
  return <AuthContext.Provider value={value} children={children} />
}

export { AuthProvider, useAuth }
