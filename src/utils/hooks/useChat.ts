import { useEffect, useState } from 'react'
import socketIOClient from 'socket.io-client'
import { API_HOST } from '../api'

export type Message = [
  id: number,
  text: string,
  timestamp: string,
  user: [id: number, showName: string, rating: number]
]

export const useChat = (appendMessage: (message: Message) => void) => {
  const [emitChat, setEmitChat] = useState<(message: string) => void>()
  useEffect(() => {
    const socket = socketIOClient(API_HOST)
    socket.on('chat', (args: Message) => {
      appendMessage(args)
    })
    const emit = (message: string) => {
      socket.emit('chat-server', message, (data: any) => {
        console.log(data)
      })
    }
    setEmitChat(emit)
    return () => {
      socket.disconnect()
    }
  }, [])
  return { emitChat }
}
