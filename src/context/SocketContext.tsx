import { useSession } from 'next-auth/react'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import socketIOClient, { Socket } from 'socket.io-client'

import { OFFLINE_MODE, SOCKET_HOST } from '@src/config'
import { useUserData } from '@src/context/UserContext'

export interface ConfirmProviderProps {
  socket: Socket | undefined
}

const SocketContext = createContext({} as ConfirmProviderProps)

export const SocketProvider = ({ children }: { children?: ReactNode }) => {
  const [socket, setSocket] = useState<Socket>()
  const { isAuthenticated } = useUserData()
  const { data: session } = useSession()
  useEffect(() => {
    if (!OFFLINE_MODE && isAuthenticated) {
      const socketClient = socketIOClient(SOCKET_HOST, {
        auth: { token: session?.accessToken },
      })
      setSocket(socketClient)
      return () => {
        socketClient.disconnect()
      }
    }
  }, [session, isAuthenticated])

  const value = { socket }
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
