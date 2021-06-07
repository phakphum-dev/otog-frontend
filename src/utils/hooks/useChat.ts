import { useEffect, useMemo, useState } from 'react'
import socketIOClient from 'socket.io-client'
import { mutate, useSWRInfinite } from 'swr'
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

export const useChat = (isOpen: boolean) => {
  const { isAuthenticated } = useAuth()

  const oldChat = useLoadChat()

  const [newMessages, setNewMessages] = useState<Message[]>([])

  const [hasUnread, setUnread] = useState(false)
  const appendMessage = (newMessage: Message) => {
    setNewMessages((prevMessages) => [...prevMessages, newMessage])
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
      socket.on('chat', (message: Message) => {
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

const mockMessages: Message[] = [
  [1, 'As you can see', '2345678', [391, 'Anos', 100]],
  [
    2,
    '[https://ideone.com]*BOLD*_Italic_~Strike~`code`',
    '2345678',
    [391, 'Anos', 100],
  ],
  [
    3,
    'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..',
    '2345678',
    [391, 'Anos', 100],
  ],
  [
    4,
    `\`for (int i = 0; i < m; i++) {
  ans = min (ans, dfs(0, i));
}\``,
    '2345678',
    [391, 'Anos', 100],
  ],
  [5, 'As you can see', '2345678', [1000, 'onAs', 100]],
  [
    6,
    '[https://ideone.com]*BOLD*_Italic_~Strike~`code`',
    '2345678',
    [1000, 'onAs', 100],
  ],
  [
    7,
    'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..',
    '2345678',
    [1000, 'onAs', 100],
  ],
  [
    8,
    `\`for (int i = 0; i < m; i++) {
  ans = min (ans, dfs(0, i));
}\``,
    '2345678',
    [1000, 'onAs', 100],
  ],
  [9, 'As you can see', '2345678', [391, 'Anos', 100]],
  [10, 'As you can see', '2345678', [1000, 'onAs', 100]],
]
