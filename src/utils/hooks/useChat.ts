import { useEffect, useState } from 'react'
import socketIOClient from 'socket.io-client'
import { useAuth } from '../api/AuthProvider'
import { useHttp } from '../api/HttpProvider'
import { SOCKET_HOST } from '../config'

export type Message = [
  id: number,
  text: string,
  timestamp: string,
  user: [id: number, showName: string, rating: number]
]

export const useChat = (appendMessage: (message: Message) => void) => {
  const [emitChat, setEmitChat] = useState<(message: string) => void>()
  const { isAuthenticated } = useAuth()
  const http = useHttp()

  useEffect(() => {
    if (isAuthenticated) {
      const socket = socketIOClient(SOCKET_HOST, {
        query: {
          token: http.getAccessToken(),
        },
      })
      socket.on('chat', (message: Message) => {
        appendMessage(message)
      })
      const emit = (message: string) => {
        socket.emit('chat-server', message, async (response: any) => {
          console.log(response)
        })
      }
      setEmitChat(() => emit)
      return () => {
        socket.disconnect()
      }
    }
  }, [isAuthenticated])
  return { emitChat }
}
