import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import socketIOClient, { Socket } from 'socket.io-client'

import { http } from './HttpClient'

import { OFFLINE_MODE, SOCKET_HOST } from '@src/config'
import { useAuth } from '@src/context/AuthContext'

export interface ConfirmProviderProps {
  socket: Socket | undefined
}

const SocketContext = createContext({} as ConfirmProviderProps)

export const SocketProvider = ({ children }: { children?: ReactNode }) => {
  const [socket, setSocket] = useState<Socket>()
  const { isAuthenticated } = useAuth()
  useEffect(() => {
    if (!OFFLINE_MODE && isAuthenticated) {
      const socketClient = socketIOClient(SOCKET_HOST, {
        auth: { token: http.getAccessToken() },
      })
      setSocket(socketClient)
      return () => {
        socketClient.disconnect()
      }
    }
  }, [isAuthenticated])

  const value = { socket }
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
