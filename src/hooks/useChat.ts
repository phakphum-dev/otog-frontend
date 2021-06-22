import { useSocket } from '@src/api/SocketProvider'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { mutate, useSWRInfinite } from 'swr'
import { useAuth } from '../api/AuthProvider'
import { User } from './useUser'

export type Message = {
  id: number
  message: string
  creationDate: string
  user: Omit<User, 'role' | 'username'>
}

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

export type SocketMessage = [
  id: number,
  message: string,
  creationDate: string,
  user: [id: number, showName: string, rating: number]
]
type ChatSocketState = {
  emitMessage?: (message: string) => void
  newMessages: Message[]
  hasUnread: boolean
}

type ChatSocketAction =
  | {
      type: 'subscribe'
    }
  | {
      type: 'new-message'
      payload: {
        message: SocketMessage
        isOpen: boolean
      }
    }
  | { type: 'read' }
  | { type: 'disconnect' }

export const useChatSocket = () => {
  const { socket } = useSocket()
  const reducer = useCallback(
    (state: ChatSocketState, action: ChatSocketAction): ChatSocketState => {
      switch (action.type) {
        case 'subscribe': {
          socket?.on('online', () => {
            mutate('user/online')
          })
          const emitMessage = (message: string) => {
            socket?.emit('chat-server', message)
          }
          return { ...state, emitMessage }
        }
        case 'new-message': {
          const [
            id,
            message,
            creationDate,
            [userId, showName, rating],
          ] = action.payload.message
          state.newMessages.push({
            id,
            message,
            creationDate,
            user: { id: userId, showName, rating },
          })
          return { ...state, hasUnread: !action.payload.isOpen }
        }
        case 'read': {
          return { ...state, hasUnread: false }
        }
        case 'disconnect': {
          socket?.disconnect()
          return { newMessages: [], hasUnread: false }
        }
        default: {
          return state
        }
      }
    },
    [socket]
  )
  return useReducer(reducer, { newMessages: [], hasUnread: false })
}

export const useChat = (isOpen: boolean) => {
  const [
    { emitMessage: emitChat, newMessages, hasUnread },
    dispatch,
  ] = useChatSocket()
  const { socket } = useSocket()

  useEffect(() => {
    if (socket) {
      dispatch({ type: 'subscribe' })
    }
  }, [socket])

  useEffect(() => {
    if (socket) {
      socket.off('chat')
      socket.on('chat', (message: SocketMessage) => {
        dispatch({ type: 'new-message', payload: { message, isOpen } })
      })
    }
  }, [socket, isOpen])

  useEffect(() => {
    if (isOpen && hasUnread) {
      dispatch({ type: 'read' })
    }
  }, [isOpen, hasUnread])

  const oldChat = useLoadChat()

  return { emitChat, newMessages, hasUnread, ...oldChat }
}
