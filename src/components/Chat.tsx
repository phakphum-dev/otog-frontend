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
  Link,
  Text,
  VStack,
} from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Textarea } from '@chakra-ui/textarea'
import { useToast } from '@chakra-ui/toast'
import { Tooltip, TooltipProps } from '@chakra-ui/tooltip'
import { SlideFade } from '@chakra-ui/transition'
import { useAuth } from '@src/api/AuthProvider'
import { useOnScreen } from '@src/hooks/useOnScreen'
import {
  ChangeEvent,
  KeyboardEvent,
  memo,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import { IoChatbubbleEllipses, IoSend } from 'react-icons/io5'
import { useChat, Message } from '@src/hooks/useChat'
import { useOnlineUsers } from '@src/hooks/useUser'
import NextLink from 'next/link'
import { toThDate } from '@src/hooks/useTimer'
import { useProfilePic } from '@src/hooks/useProfilePic'

interface ChatButtonProps extends IconButtonProps {
  hasUnread: boolean
}

const ChatButton = ({ hasUnread, ...props }: ChatButtonProps) => (
  <Box position="fixed" bottom={5} right={5} zIndex={100}>
    <Box position="relative" zIndex={101}>
      {hasUnread && (
        <Circle position="absolute" top={1} right={1} boxSize={2} bg="orange" />
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
          {onlineUsers.map((user) => (
            <HStack key={user.id}>
              <Circle size={2} bg="green.400" />
              <Text>{user.showName}</Text>
            </HStack>
          ))}
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
  }, [isIntersecting])

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
                    message={message}
                    sameUserAbove={
                      message.user.id ===
                      (index && newMessages[index - 1].user.id)
                    }
                    sameUserBelow={
                      message.user.id ===
                      (index + 1 === newMessages.length
                        ? 0
                        : newMessages[index + 1].user.id)
                    }
                  />
                ))}
              </Flex>
              <Flex direction="column-reverse">
                {messages?.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    sameUserAbove={
                      message.user.id ===
                      (index + 1 === messages.length
                        ? 0
                        : messages[index + 1].user.id)
                    }
                    sameUserBelow={
                      message.user.id === (index && messages[index - 1].user.id)
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

interface ChatMessageProps {
  message: Message
  sameUserAbove?: boolean
  sameUserBelow?: boolean
}

const ChatMessage = memo(
  (props: ChatMessageProps) => {
    const { message, sameUserAbove = false, sameUserBelow = false } = props

    const { user } = useAuth()
    const isMyself = user?.id === message.user.id
    const isOther = !isMyself
    const displayName = isOther && !sameUserAbove
    const displayAvatar = isOther && !sameUserBelow

    const bg = useColorModeValue('gray.100', 'gray.800')
    const borderColor = useColorModeValue('gray.100', 'whiteAlpha.300')

    return (
      <Flex
        direction={isOther ? 'row' : 'row-reverse'}
        mt={sameUserAbove ? 0.5 : 2}
        align="flex-end"
      >
        {displayAvatar ? (
          <SmallAvatar userId={message.user.id} />
        ) : (
          isOther && <Box minW={6} mr={1} />
        )}
        <VStack align="flex-start" spacing={0}>
          {displayName && (
            <Text fontSize="xs" color="gray.500" px={1}>
              {message.user.showName}
            </Text>
          )}
          <Text
            title={toThDate(message.creationDate)}
            px={2}
            py={1}
            {...{ [isMyself ? 'ml' : 'mr']: 2 }}
            rounded={16}
            borderWidth="1px"
            bg={isMyself ? 'otog' : bg}
            color={isMyself ? 'white' : undefined}
            borderColor={isMyself ? 'otog' : borderColor}
            whiteSpace="pre-wrap"
            wordBreak="break-word"
          >
            {formatParser(message.message)}
          </Text>
        </VStack>
      </Flex>
    )
  },
  (prevProps, nextProps) =>
    prevProps.message.id === nextProps.message.id &&
    prevProps.sameUserAbove === nextProps.sameUserAbove &&
    prevProps.sameUserBelow === nextProps.sameUserBelow
)

const SmallAvatar = ({ userId }: { userId: number }) => {
  const { url } = useProfilePic(userId, { small: true })
  return (
    <NextLink href={`/profile/${userId}`} passHref>
      <Avatar as="a" size="xs" mr={1} src={url} />
    </NextLink>
  )
}

const matcher: Record<
  string,
  { match: string; formatter: (token: string) => ReactNode }
> = {
  _: { match: '_', formatter: (token) => <i>{token}</i> },
  '~': { match: '~', formatter: (token) => <s>{token}</s> },
  '*': { match: '*', formatter: (token) => <b>{token}</b> },
  '`': {
    match: '`',
    formatter: (token) => (
      <Code
        color="inherit"
        bg={useColorModeValue('transparent', 'blackAlpha.300')}
      >
        {token}
      </Code>
    ),
  },
  '[': {
    match: ']',
    formatter: (token) => (
      <Link href={token} isExternal textDecor="underline" color="inherit">
        {token}
      </Link>
    ),
  },
}

const formatted = (token: string, format: string) => {
  return matcher[format]?.formatter(token) ?? <>{token}</>
}

const formatParser = (message: string) => {
  const tokens: ReactNode[] = []
  let token: string = ''
  let format: string = ''
  for (let i = 0; i < message.length; i++) {
    if (format && matcher[format].match === message[i]) {
      tokens.push(formatted(token.slice(1), format))
      format = ''
      token = ''
    } else if (!format && message[i] in matcher) {
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
