import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import socketIOClient, { Socket } from 'socket.io-client'

import { SOCKET_HOST } from '@src/config'
import { useAuth } from '@src/context/AuthContext'
import { useHttp } from '@src/context/HttpContext'

export interface ConfirmProviderProps {
  socket: Socket | undefined
}

const SocketContext = createContext({} as ConfirmProviderProps)

export const SocketProvider = ({ children }: { children?: ReactNode }) => {
  const [socket, setSocket] = useState<Socket>()
  const { isAuthenticated } = useAuth()
  const http = useHttp()
  useEffect(() => {
    if (isAuthenticated) {
      const socketClient = socketIOClient(SOCKET_HOST, {
        auth: { token: http.getAccessToken() },
      })
      setSocket(socketClient)
      return () => {
        socket?.disconnect()
      }
    }
  }, [isAuthenticated, http, socket])

  const value = { socket }
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
