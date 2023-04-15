import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { mutate } from 'swr'
import useSWRInfinite from 'swr/infinite'

import { useUserData } from '../context/UserContext'
import { Message } from './types'

import { useSocket } from '@src/context/SocketContext'

const useLoadChat = () => {
  const { isAuthenticated } = useUserData()

  const {
    data: oldMessages,
    setSize,
    isValidating,
  } = useSWRInfinite<Message[]>(
    (pageIndex: number, previousPageData) => {
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

  const messages = useMemo(
    () => oldMessages?.flatMap((messages) => messages),
    [oldMessages]
  )
  const loadMore = useCallback(() => {
    setSize((size) => size + 1)
  }, [setSize])

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
  | { type: 'start' }
  | {
      type: 'new-message'
      payload: {
        message: SocketMessage
        isOpen: boolean
      }
    }
  | { type: 'read' }
  | { type: 'clear' }

export const useChatSocket = () => {
  const { socket } = useSocket()
  const reducer = useCallback(
    (state: ChatSocketState, action: ChatSocketAction): ChatSocketState => {
      switch (action.type) {
        case 'start': {
          socket?.on('online', () => {
            mutate('user/online')
          })
          const emitMessage = (message: string) => {
            socket?.emit('chat-server', message)
          }
          return { ...state, emitMessage }
        }
        case 'new-message': {
          const [id, message, creationDate, [userId, showName, rating]] =
            action.payload.message
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
        case 'clear': {
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
  const [{ emitMessage: emitChat, newMessages, hasUnread }, dispatch] =
    useChatSocket()
  const { socket } = useSocket()
  const { isAuthenticated } = useUserData()
  useEffect(() => {
    if (socket) {
      if (isAuthenticated) {
        dispatch({ type: 'start' })
      } else {
        dispatch({ type: 'clear' })
      }
    }
  }, [socket, dispatch, isAuthenticated])

  useEffect(() => {
    if (socket) {
      socket.on('chat', (message: SocketMessage) => {
        dispatch({ type: 'new-message', payload: { message, isOpen } })
      })
      return () => {
        socket.off('chat')
      }
    }
  }, [socket, isOpen, dispatch])

  useEffect(() => {
    if (isOpen && hasUnread) {
      dispatch({ type: 'read' })
    }
  }, [isOpen, hasUnread, dispatch])

  const oldChat = useLoadChat()

  return { emitChat, newMessages, hasUnread, ...oldChat }
}
