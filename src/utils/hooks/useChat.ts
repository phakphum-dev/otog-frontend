import { useEffect, useMemo, useState } from 'react'
import socketIOClient from 'socket.io-client'
import { useSWRInfinite } from 'swr'
import { useAuth } from '../api/AuthProvider'
import { useHttp } from '../api/HttpProvider'
import { SOCKET_HOST } from '../config'

export type Message = [
  id: number,
  text: string,
  timestamp: string,
  user: [id: number, showName: string, rating: number]
]

const useLoadChat = () => {
  const { isAuthenticated } = useAuth()
  const { data: oldMessages, setSize, size, isValidating } = useSWRInfinite<
    Message[]
  >(
    (pageIndex, previousPageData) => {
      if (!isAuthenticated) return null

      // reached the end
      if (previousPageData && !previousPageData.length) return null

      // first page, we don't have `previousPageData`
      if (pageIndex === 0 || !previousPageData) return 'chat'

      // add the cursor to the API endpoint
      return `chat?offset=${previousPageData[previousPageData?.length - 1][0]}`
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )
  const messages = useMemo(() => oldMessages?.flatMap((messages) => messages), [
    oldMessages,
  ])
  const loadMore = () => {
    setSize((size) => size + 1)
  }
  const hasMore = isValidating || (oldMessages && oldMessages.length === size)

  return { messages, loadMore, hasMore }
}

export const useChat = () => {
  const { isAuthenticated } = useAuth()

  const oldChat = useLoadChat()

  const [newMessages, setNewMessages] = useState<Message[]>([])
  const appendMessage = (newMessage: Message) => {
    setNewMessages((prevMessages) => [...prevMessages, newMessage])
  }

  const [emitChat, setEmitChat] = useState<(message: string) => void>()
  const http = useHttp()
  useEffect(() => {
    if (isAuthenticated) {
      const socket = socketIOClient(SOCKET_HOST, {
        auth: { token: http.getAccessToken() },
      })
      socket.on('chat', (message: Message) => {
        appendMessage(message)
      })
      const emit = (message: string) => {
        socket.emit('chat-server', message)
      }
      setEmitChat(() => emit)
      return () => {
        socket.disconnect()
      }
    }
  }, [isAuthenticated])

  return { emitChat, newMessages, ...oldChat }
}
