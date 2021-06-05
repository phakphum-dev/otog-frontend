import { Avatar } from '@chakra-ui/avatar'
import { Button, IconButton, IconButtonProps } from '@chakra-ui/button'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { useDisclosure } from '@chakra-ui/hooks'
import { SmallCloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Circle,
  Code,
  Flex,
  Heading,
  HStack,
  Text,
} from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Textarea } from '@chakra-ui/textarea'
import { useToast } from '@chakra-ui/toast'
import { Tooltip, TooltipProps } from '@chakra-ui/tooltip'
import { SlideFade } from '@chakra-ui/transition'
import { useAuth } from '@src/utils/api/AuthProvider'
import { useOnScreen } from '@src/utils/hooks/useOnScreen'
import {
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import { IoChatbubbleEllipses, IoSend } from 'react-icons/io5'
import { useChat, Message } from '@src/utils/hooks/useChat'

const ChatButton = (props: IconButtonProps) => {
  const bg = useColorModeValue('white', 'gray.800')
  return (
    <Box position="fixed" bottom={6} right={6} zIndex={100}>
      <OnlineUsersTooltip placement="top">
        <IconButton
          isRound
          color="gray.500"
          size="lg"
          variant="outline"
          bg={bg}
          icon={<IoChatbubbleEllipses />}
          {...props}
        />
      </OnlineUsersTooltip>
    </Box>
  )
}

const OnlineUsersTooltip = (props: TooltipProps) => {
  return (
    <Tooltip
      hasArrow
      label={
        <Flex flexDir="column" justify="flex-start">
          {onlineUsers.map((showName, index) => (
            <HStack key={index}>
              <Circle size={2} bg="green.400" />
              <Text>{showName}</Text>
            </HStack>
          ))}
        </Flex>
      }
      {...props}
    />
  )
}

export const Chat = () => {
  const { isOpen, onClose, onToggle } = useDisclosure()
  const bg = useColorModeValue('white', 'gray.800')
  const { ref, isIntersecting } = useOnScreen()
  const [newMessages, setNewMessages] = useState<Message[]>([])
  const { user } = useAuth()
  useEffect(() => {
    console.log('load more', isIntersecting)
  }, [isIntersecting])
  if (!user) {
    return null
  }
  const appendMessage = (newMessage: Message) => {
    setNewMessages((prevMessages) => [...prevMessages, newMessage])
  }
  const { emitChat } = useChat(appendMessage)

  return (
    <>
      <ChatButton aria-label="open-chat" onClick={onToggle} />
      <Box position="fixed" bottom={0} right={[0, null, 4]} zIndex={100}>
        <SlideFade in={isOpen} style={{ zIndex: 100 }} unmountOnExit={true}>
          <Flex
            width="320px"
            height="420px"
            flexDir="column"
            borderWidth="1px"
            rounded="lg"
            borderBottomRadius={0}
            boxShadow="sm"
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
            >
              <Flex direction="column">
                {newMessages.map((message, index, newMessages) => {
                  const [id] = message
                  const [latestMessageId] = newMessages[index - 1]
                  return (
                    <ChatMessage
                      key={id}
                      message={message}
                      repeated={!!index && id === latestMessageId}
                    />
                  )
                })}
              </Flex>
              {/* <Flex direction="column-reverse">
                {messages.map((message, index, messages) => (
                  <ChatMessage
                    key={index}
                    {...message}
                    repeated={
                      index + 1 !== messages.length &&
                      message.id === messages[index + 1].id
                    }
                  />
                ))}
              </Flex>
              <Flex justify="center" py={2} ref={ref}>
                <Spinner />
              </Flex> */}
            </Flex>
            <ChatInput emitChat={emitChat} />
          </Flex>
        </SlideFade>
      </Box>
    </>
  )
}

interface ChatInputProps {
  emitChat?: (message: string) => void
}

const ChatInput = (props: ChatInputProps) => {
  const { emitChat } = props
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
      emitChat?.(msg)
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
  return (
    <HStack p={2} spacing={1}>
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

interface ChatMessageProps {
  message: Message
  repeated?: boolean
}

const onlineUsers = ['Anos', 'bruh', 'ไม่ใช่ตอต่อต้อต๊อต๋อ']

const ChatMessage = (props: ChatMessageProps) => {
  const { message, repeated = false } = props
  const [id, text, timestamp, sender] = message
  const [senderId, senderName, senderRating] = sender

  const { user } = useAuth()
  const isOther = user?.id !== senderId
  const displayName = isOther && !repeated

  const bg = useColorModeValue('gray.100', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.300')

  return (
    <Flex direction={isOther ? 'row' : 'row-reverse'} mt={repeated ? 0.5 : 2}>
      {displayName ? (
        <Avatar size="xs" mt={7} mr={1} />
      ) : (
        isOther && <Box minW={6} mr={1} />
      )}
      <Flex direction="column">
        {displayName && (
          <Text fontSize="xs" color="gray.500" px={1}>
            {senderName}
          </Text>
        )}
        <Text
          title={timestamp}
          px={2}
          py={1}
          mr={isOther ? 2 : undefined}
          ml={isOther ? undefined : 2}
          rounded={16}
          borderWidth="1px"
          bg={isOther ? bg : 'otog'}
          color={isOther ? undefined : 'white'}
          borderColor={isOther ? borderColor : 'otog'}
          whiteSpace="pre-wrap"
        >
          {formatParser(text)}
        </Text>
      </Flex>
    </Flex>
  )
}

const formatter: Record<string, (token: string) => ReactNode> = {
  _: (token) => <i>{token}</i>,
  '~': (token) => <s>{token}</s>,
  '*': (token) => <b>{token}</b>,
  '`': (token) => (
    <Code
      color="inherit"
      bg={useColorModeValue('transparent', 'blackAlpha.300')}
    >
      {token}
    </Code>
  ),
}

const formatted = (token: string, format: string) => {
  return formatter[format]?.(token) ?? <>{token}</>
}

const formatParser = (message: string) => {
  const tokens: ReactNode[] = []
  let token: string = ''
  let format: string = ''
  for (let i = 0; i < message.length; i++) {
    if (format && message[i] === format) {
      tokens.push(formatted(token.slice(1), format))
      format = ''
      token = ''
    } else if (!format && message[i] in formatter) {
      tokens.push(token)
      format = message[i]
      token = message[i]
    } else {
      token += message[i]
    }
  }
  if (token) {
    tokens.push(token)
  }
  return tokens
}
