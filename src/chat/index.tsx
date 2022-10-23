import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'
import { IoChatbubbleEllipses, IoSend } from 'react-icons/io5'

import { ChatMessage } from './components/ChatMessage'

import { Button, IconButton, IconButtonProps } from '@chakra-ui/button'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { useDisclosure } from '@chakra-ui/hooks'
import { SmallCloseIcon } from '@chakra-ui/icons'
import { Box, Circle, Flex, HStack, Heading, Text } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Textarea } from '@chakra-ui/textarea'
import { useToast } from '@chakra-ui/toast'
import { Tooltip, TooltipProps } from '@chakra-ui/tooltip'
import { SlideFade } from '@chakra-ui/transition'

import { useChat } from '@src/chat/useChat'
import { useAuth } from '@src/context/AuthContext'
import { useOnScreen } from '@src/hooks/useOnScreen'
import { useOnlineUsers } from '@src/user/queries'

interface ChatButtonProps extends IconButtonProps {
  hasUnread: boolean
}

const MAX_LENGTH = 15

const ChatButton = ({ hasUnread, ...props }: ChatButtonProps) => (
  <Box position="fixed" bottom={5} right={5} zIndex={100}>
    <Box position="relative" zIndex={101}>
      {hasUnread && (
        <Circle position="absolute" top={1} right={1} size={2} bg="orange" />
      )}
    </Box>
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
  </Box>
)

const OnlineUsersTooltip = (props: TooltipProps) => {
  const { data: onlineUsers } = useOnlineUsers()
  return onlineUsers ? (
    <Tooltip
      hasArrow
      label={
        <Flex flexDir="column" justify="flex-start">
          {onlineUsers.slice(0, MAX_LENGTH).map((user) => (
            <HStack key={user.id}>
              <Circle size={2} bg="green.400" />
              <Text maxW={275} noOfLines={3}>
                {user.showName}
              </Text>
            </HStack>
          ))}
          {onlineUsers.length > MAX_LENGTH && (
            <>
              <HStack>
                <Text>...</Text>
              </HStack>
              <HStack>
                <Text>(ยังมีชีวิตอยู่ทั้งหมด {onlineUsers.length} คน)</Text>
              </HStack>
            </>
          )}
        </Flex>
      }
      {...props}
    />
  ) : (
    <>{props.children}</>
  )
}

export const Chat = () => {
  const bg = useColorModeValue('white', 'gray.800')

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
      <Box position="fixed" bottom={0} right={[0, null, 4]} zIndex={100}>
        <SlideFade in={isOpen} style={{ zIndex: 100 }} unmountOnExit={true}>
          <Flex
            width="320px"
            height="420px"
            direction="column"
            rounded="lg"
            borderBottomRadius={0}
            boxShadow="md"
            bg={bg}
          >
            <OnlineUsersTooltip placement="top-start">
              <Button
                p={6}
                onClick={onClose}
                borderBottomRadius={0}
                justifyContent="space-between"
                rightIcon={<SmallCloseIcon />}
                variant="otog"
              >
                <Heading as="h3" size="sm">
                  OTOG Chat
                </Heading>
              </Button>
            </OnlineUsersTooltip>
            <Flex
              direction="column-reverse"
              px={2}
              flex={1}
              overflowY="auto"
              overflowX="hidden"
              borderWidth="1px"
              borderY="unset"
            >
              <Flex direction="column">
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
              </Flex>
              <Flex direction="column-reverse">
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
              </Flex>
              {hasMore && (
                <Flex justify="center" py={2} ref={ref}>
                  <Spinner />
                </Flex>
              )}
            </Flex>
            <Flex borderWidth="1px" borderY="unset">
              <ChatInput emitMessage={emitChat} onClose={onClose} />
            </Flex>
          </Flex>
        </SlideFade>
      </Box>
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
    <HStack p={2} spacing={1} flex={1}>
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
    </HStack>
  )
}
