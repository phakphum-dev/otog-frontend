import {
  createContext,
  ProviderProps,
  useContext,
  useEffect,
  useState,
} from 'react'
import nookies from 'nookies'
import { useHttp } from './HttpProvider'

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
  login: (credentials: LoginReqDTO) => Promise<void>
  logout: () => Promise<void>
}

export type AuthValueProps = ProviderProps<UserAuthDTO | null>

const AuthContext = createContext({} as AuthProviderProps)
const useAuth = () => useContext(AuthContext)
const AuthProvider = (props: AuthValueProps) => {
  const { value: userValue, children } = props
  const [user, setUser] = useState(userValue ?? null)
  useEffect(() => {
    if (userValue === null) {
      setUser(null)
    }
  }, [userValue])
  const isAuthenticated = !!user

  const http = useHttp()
  const login = async (credentials: LoginReqDTO) => {
    const { accessToken, user } = await http.post<LoginReqDTO, AuthResDTO>(
      `auth/login`,
      credentials
    )
    setUser(user)
    nookies.set(null, 'accessToken', accessToken)
  }

  const logout = async () => {
    setUser(null)
    nookies.destroy(null, 'accessToken')
  }

  useEffect(() => {
    http.onLogout = logout
  }, [])

  const value = { login, logout, user, isAuthenticated }
  return <AuthContext.Provider value={value} children={children} />
}

export { AuthProvider, useAuth }
