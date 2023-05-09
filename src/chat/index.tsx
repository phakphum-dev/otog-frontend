import { SlideFade } from '@chakra-ui/transition'
import NextLink from 'next/link'
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  forwardRef,
  useEffect,
  useState,
} from 'react'
import { toast } from 'react-hot-toast'
import { IoChatbubbleEllipses, IoClose, IoSend } from 'react-icons/io5'

import { ChatMessage } from './components/ChatMessage'

import { useChat } from '@src/chat/useChat'
import { useUserData } from '@src/context/UserContext'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { useOnScreen } from '@src/hooks/useOnScreen'
import { Button } from '@src/ui/Button'
import { IconButton, IconButtonProps } from '@src/ui/IconButton'
import { Textarea } from '@src/ui/Input'
import { Link } from '@src/ui/Link'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@src/ui/Modal'
import { Spinner } from '@src/ui/Spinner'
import { Tooltip, TooltipProps } from '@src/ui/Tooltip'
import { useOnlineUsers } from '@src/user/queries'

type ChatButtonProps = Omit<IconButtonProps, 'as' | 'icon'> & {
  hasUnread: boolean
}

const MAX_LENGTH = 15

const ChatButton = forwardRef<HTMLButtonElement, ChatButtonProps>(
  ({ hasUnread, ...props }, ref) => (
    <div className="fixed bottom-5 right-5 z-30">
      <div className="relative z-40">
        {hasUnread && (
          <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-otog" />
        )}
      </div>
      <OnlineUsersTooltip placement="top-end">
        <IconButton
          rounded
          className="text-2xl"
          variant="solid"
          size="lg"
          icon={<IoChatbubbleEllipses />}
          {...props}
          ref={ref}
        />
      </OnlineUsersTooltip>
    </div>
  )
)

const OnlineUsersTooltip = (props: TooltipProps) => {
  const { data: onlineUsers } = useOnlineUsers()
  return onlineUsers ? (
    <Tooltip
      label={
        <div className="flex flex-col justify-start">
          {onlineUsers.slice(0, MAX_LENGTH).map((user) => (
            <div className="flex items-center gap-2" key={user.id}>
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <div className="max-w-[275px] line-clamp-3">{user.showName}</div>
            </div>
          ))}
          {onlineUsers.length > MAX_LENGTH && (
            <>
              <div className="flex gap-2">
                <div>...ทั้งหมด {onlineUsers.length} คน</div>
              </div>
            </>
          )}
        </div>
      }
      {...props}
    />
  ) : (
    <>{props.children}</>
  )
}

export const Chat = () => {
  const { isOpen, onClose, onToggle } = useDisclosure()
  const { emitChat, messages, hasMore, loadMore, newMessages, hasUnread } =
    useChat(isOpen)
  const { ref, isIntersecting } = useOnScreen()
  useEffect(() => {
    if (isIntersecting && hasMore) {
      loadMore()
    }
  }, [isIntersecting, loadMore, hasMore])

  const onUserModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onModalOpen()
  }
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure()

  const { isAuthenticated } = useUserData()
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <ChatButton
        aria-label="open-chat"
        onClick={onToggle}
        hasUnread={hasUnread}
      />
      <div className="fixed bottom-0 right-0 z-40 md:right-4">
        <SlideFade in={isOpen} style={{ zIndex: 100 }} unmountOnExit={true}>
          <div className="flex h-[420px] w-[320px] flex-col rounded-lg rounded-b-none bg-white shadow-md dark:bg-gray-800">
            <OnlineUsersTooltip placement="top-start">
              <Button
                className="justify-between rounded-b-none p-6"
                onClick={onClose}
                rightIcon={<IoClose />}
                colorScheme="otog"
              >
                <Button
                  className="text-md font-bold"
                  variant="link"
                  onClick={onUserModalOpen}
                >
                  OTOG Chat
                </Button>
              </Button>
            </OnlineUsersTooltip>
            <OnlineUserModal isOpen={isModalOpen} onClose={onModalClose} />
            <div className="flex flex-1 flex-col-reverse overflow-y-auto overflow-x-hidden border border-y-0 px-2">
              <div className="flex flex-col">
                {newMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    messageAbove={
                      index === 0 ? messages?.[0] : newMessages[index - 1]
                    }
                    messageData={message}
                    messageBelow={newMessages[index + 1]}
                  />
                ))}
              </div>
              <div className="flex flex-col-reverse">
                {messages?.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    messageAbove={messages[index + 1]}
                    messageData={message}
                    messageBelow={
                      index === 0 ? newMessages[0] : messages[index - 1]
                    }
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center py-2" ref={ref}>
                  <Spinner />
                </div>
              )}
            </div>
            <div className="flex border border-y-0">
              <ChatInput emitMessage={emitChat} onClose={onClose} />
            </div>
          </div>
        </SlideFade>
      </div>
    </>
  )
}

interface ChatInputProps {
  onClose: () => void
  emitMessage?: (message: string) => void
}

const ChatInput = (props: ChatInputProps) => {
  const { emitMessage, onClose } = props
  const [message, setMessage] = useState('')
  const onSubmit = () => {
    const msg = message.trim()
    if (msg) {
      if (msg.length > 150) {
        toast.error(
          <div>
            <b>ข้อความมีความยาวเกินที่กำหนดไว้</b>
            <p>(150 ตัวอักษร)</p>
          </div>
        )
        return
      }
      emitMessage?.(msg)
    }
    setMessage('')
  }
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }
  const onKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }
  return (
    <div className="flex flex-1 gap-1 p-2">
      <Textarea
        rounded="2xl"
        autoFocus
        placeholder="Type your message..."
        name="message"
        value={message}
        onChange={onChange}
        onKeyDown={onKeydown}
      />
      <IconButton
        aria-label="send message"
        icon={<IoSend />}
        rounded
        variant="ghost"
        onClick={onSubmit}
      />
    </div>
  )
}

type OnlineUserModalProps = {
  isOpen: boolean
  onClose: () => void
}

const OnlineUserModal = (props: OnlineUserModalProps) => {
  const { isOpen, onClose } = props
  const { data: onlineUsers } = useOnlineUsers()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ยังมีชีวิตอยู่</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div className="flex flex-col gap-2">
            {onlineUsers ? (
              onlineUsers.map((user) => (
                <NextLink
                  href={`/profile/${user.id}`}
                  key={user.id}
                  passHref
                  legacyBehavior
                >
                  <Link
                    className="max-w-[300px]"
                    variant="hidden"
                    onClick={onClose}
                  >
                    {user.showName}
                  </Link>
                </NextLink>
              ))
            ) : (
              <div className="flex justify-center">
                <Spinner />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
