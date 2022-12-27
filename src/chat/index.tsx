import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'
import { IoChatbubbleEllipses, IoSend } from 'react-icons/io5'

import { ChatMessage } from './components/ChatMessage'

import { IconButton, IconButtonProps } from '@chakra-ui/button'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { useDisclosure } from '@chakra-ui/hooks'
import { SmallCloseIcon } from '@chakra-ui/icons'
import { Circle, Heading, Text } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Textarea } from '@chakra-ui/textarea'
import { useToast } from '@chakra-ui/toast'
import { Tooltip, TooltipProps } from '@chakra-ui/tooltip'
import { SlideFade } from '@chakra-ui/transition'

import { useChat } from '@src/chat/useChat'
import { useAuth } from '@src/context/AuthContext'
import { useOnScreen } from '@src/hooks/useOnScreen'
import { Button } from '@src/ui/Button'
import { useOnlineUsers } from '@src/user/queries'

interface ChatButtonProps extends IconButtonProps {
  hasUnread: boolean
}

const MAX_LENGTH = 15

const ChatButton = ({ hasUnread, ...props }: ChatButtonProps) => (
  <div className="fixed bottom-5 right-5 z-100">
    <div className="relative z-101">
      {hasUnread && (
        <Circle position="absolute" top={1} right={1} size={2} bg="orange" />
      )}
    </div>
    <OnlineUsersTooltip placement="top-end">
      <IconButton
        isRound
        boxSize="50"
        variant="solid"
        fontSize="x-large"
        borderWidth="1px"
        boxShadow="sm"
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.400', 'gray.500')}
        icon={<IoChatbubbleEllipses />}
        colorScheme="orange"
        _hover={{
          bg: 'orange.400',
          color: 'white',
          borderColor: 'orange.400',
        }}
        _active={{
          bg: 'orange.700',
          borderColor: 'orange.700',
        }}
        {...props}
      />
    </OnlineUsersTooltip>
  </div>
)

const OnlineUsersTooltip = (props: TooltipProps) => {
  const { data: onlineUsers } = useOnlineUsers()
  return onlineUsers ? (
    <Tooltip
      hasArrow
      label={
        <div className="flex flex-col justify-start">
          {onlineUsers.slice(0, MAX_LENGTH).map((user) => (
            <div className="flex items-center gap-2" key={user.id}>
              <Circle size={2} bg="green.400" />
              <Text maxW={275} noOfLines={3}>
                {user.showName}
              </Text>
            </div>
          ))}
          {onlineUsers.length > MAX_LENGTH && (
            <>
              <div className="flex gap-2">
                <Text>...</Text>
              </div>
              <div className="flex gap-2">
                <Text>(ยังมีชีวิตอยู่ทั้งหมด {onlineUsers.length} คน)</Text>
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
  const {
    emitChat,
    messages,
    hasMore,
    loadMore,
    newMessages,
    hasUnread,
  } = useChat(isOpen)
  const { ref, isIntersecting } = useOnScreen()
  useEffect(() => {
    if (isIntersecting && hasMore) {
      loadMore()
    }
  }, [isIntersecting, loadMore, hasMore])

  const { isAuthenticated } = useAuth()
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
      <div className="fixed bottom-0 right-0 md:right-4 z-100">
        <SlideFade in={isOpen} style={{ zIndex: 100 }} unmountOnExit={true}>
          <div className="flex flex-col w-[320px] h-[420px] rounded-lg rounded-b-none shadow-md bg-white dark:bg-gray-800">
            <OnlineUsersTooltip placement="top-start">
              <Button
                className="!p-6 rounded-b-none justify-between"
                onClick={onClose}
                rightIcon={<SmallCloseIcon />}
                colorScheme="otog"
              >
                <Heading as="h3" size="sm">
                  OTOG Chat
                </Heading>
              </Button>
            </OnlineUsersTooltip>
            <div className="flex flex-col-reverse px-2 flex-1 overflow-y-auto overflow-x-hidden border border-y-0">
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
  const toast = useToast()
  const onSubmit = () => {
    const msg = message.trim()
    if (msg) {
      if (msg.length > 150) {
        toast({
          title: 'ข้อความมีความยาวเกินที่กำหนดไว้ (150 ตัวอักษร)',
          position: 'top-right',
          isClosable: true,
          status: 'warning',
          duration: 3000,
        })
        return
      }
      emitMessage?.(msg)
    }
    setMessage('')
  }
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }
  const onKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }
  const onKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }
  return (
    <div className="flex gap-1 flex-1 p-2">
      <Textarea
        rows={1}
        rounded={16}
        size="sm"
        resize="none"
        autoFocus
        placeholder="Type your message..."
        name="message"
        value={message}
        onChange={onChange}
        onKeyPress={onKeyPress}
        onKeyDown={onKeydown}
      />
      <IconButton
        aria-label="send message"
        icon={<IoSend />}
        isRound
        variant="ghost"
        onClick={onSubmit}
      />
    </div>
  )
}
