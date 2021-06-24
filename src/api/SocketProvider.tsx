import { SOCKET_HOST, USER_SOCKET_KEY } from '@src/utils/config'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'
import socketIOClient, { Socket } from 'socket.io-client'
import { useAuth } from '@src/api/AuthProvider'
import { useHttp } from '@src/api/HttpProvider'

export interface ConfirmProviderProps {
  socket: Socket | undefined
}

const SocketContext = createContext({} as ConfirmProviderProps)

export const SocketProvider = ({ children }: PropsWithChildren<{}>) => {
  const [socket, setSocket] = useState<Socket>()
  const { isAuthenticated } = useAuth()
  const http = useHttp()
  useEffect(() => {
    if (isAuthenticated) {
      const socketClient = socketIOClient(SOCKET_HOST, {
        auth: { token: http.getAccessToken() },
        extraHeaders: { key: USER_SOCKET_KEY },
      })
      setSocket(socketClient)
      return () => {
        socket?.disconnect()
      }
    }
  }, [isAuthenticated])

  const value = { socket }
  return <SocketContext.Provider value={value} children={children} />
}

export function useSocket() {
  return useContext(SocketContext)
}
