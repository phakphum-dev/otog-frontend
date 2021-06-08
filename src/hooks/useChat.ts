import { useEffect, useMemo, useState } from 'react'
import socketIOClient from 'socket.io-client'
import { mutate, useSWRInfinite } from 'swr'
import { useAuth } from '../api/AuthProvider'
import { useHttp } from '../api/HttpProvider'
import { SOCKET_HOST } from '../utils/config'
import { User } from './useUser'

export type Message = {
  id: number
  message: string
  creationDate: string
  user: Omit<User, 'role' | 'username'>
}

export type SocketMessage = [
  id: number,
  message: string,
  creationDate: string,
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
      return `chat?offset=${previousPageData[previousPageData?.length - 1].id}`
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )
  const messages = useMemo(() => oldMessages?.flatMap((messages) => messages), [
    oldMessages,
  ])
  const loadMore = () => {
    setSize((size) => size + 1)
  }
  const hasMore =
    isValidating ||
    (oldMessages && oldMessages[oldMessages.length - 1].length > 0)

  return { messages, loadMore, hasMore }
}

export const useChat = (isOpen: boolean) => {
  const { isAuthenticated } = useAuth()

  const oldChat = useLoadChat()

  const [newMessages, setNewMessages] = useState<Message[]>([])

  const [hasUnread, setUnread] = useState(false)
  const appendMessage = ([
    id,
    message,
    creationDate,
    [userId, showName, rating],
  ]: SocketMessage) => {
    setNewMessages((prevMessages) => [
      ...prevMessages,
      { id, message, creationDate, user: { id: userId, showName, rating } },
    ])
    if (!isOpen) {
      setUnread(true)
    }
  }
  useEffect(() => {
    if (isOpen) {
      setUnread(false)
    }
  }, [isOpen])

  const http = useHttp()
  const [emitChat, setEmitChat] = useState<(message: string) => void>()
  useEffect(() => {
    if (isAuthenticated) {
      const socket = socketIOClient(SOCKET_HOST, {
        auth: { token: http.getAccessToken() },
      })
      socket.on('chat', (message: SocketMessage) => {
        appendMessage(message)
      })
      socket.on('online', () => {
        mutate('user/online')
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

  return { emitChat, newMessages, hasUnread, ...oldChat }
}
