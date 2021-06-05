import { Avatar } from '@chakra-ui/avatar'
import { Button, IconButton, IconButtonProps } from '@chakra-ui/button'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { useDisclosure } from '@chakra-ui/hooks'
import { SmallCloseIcon } from '@chakra-ui/icons'
import {
  Box,
  BoxProps,
  Circle,
  Code,
  Flex,
  Heading,
  HStack,
  Text,
  TextProps,
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
  const [newMessages, setNewMessages] = useState(mockNewMessages)
  const { user } = useAuth()
  useEffect(() => {
    console.log('load more', isIntersecting)
  }, [isIntersecting])
  if (!user) {
    return null
  }
  const appendNewMessage = (message: string) => {
    setNewMessages((prevMessages) => [
      ...prevMessages,
      { message, showName: user.showName, id: user.id },
    ])
  }

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
                {newMessages.map((message, index, newMessages) => (
                  <ChatMessage
                    key={index}
                    {...message}
                    repeated={
                      !!index && message.id === newMessages[index - 1].id
                    }
                  />
                ))}
              </Flex>
              <Flex direction="column-reverse">
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
              </Flex>
            </Flex>
            <ChatInput appendNewMessage={appendNewMessage} />
          </Flex>
        </SlideFade>
      </Box>
    </>
  )
}

interface ChatInputProps {
  appendNewMessage: (message: string) => void
}

const ChatInput = (props: ChatInputProps) => {
  const { appendNewMessage } = props
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
      appendNewMessage(msg)
      console.log('send', msg)
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

interface Message {
  message: string
  id?: number
  showName: string
  rating?: number
}

interface ChatMessageProps extends Message {
  repeated?: boolean
}

let mockNewMessages: Message[] = [
  {
    message: 'test1',
    showName: 'bruh',
    id: 1,
  },
  {
    message: 'test2',
    showName: 'bruh',
    id: 1,
  },
  {
    message: 'test3',
    showName: 'bruh',
    id: 1,
  },
  {
    message: `ขออธิบายในส่วนของตรงนี้ว่า
\`for (int di : {-1, 0, 1}) {
  int ni = i + di;
  // do something
}\`
*BOLD* _Italic_ ~Strikethrough~`,
    showName: 'Anos',
    id: 391,
  },
]
const messages: Message[] = [
  {
    message: 'test',
    showName: 'bruh',
    id: 1,
  },
  {
    message: '............................................',
    showName: 'bruh',
    id: 1,
  },
  {
    message:
      'เรื่องราวมีอยู่ว่าขณะท่ี CrazyDave เพื่อนบ้านของคุณซึ่งเขามีบ้านอยู่ติดกับบ้านคุณและคุณก็ มีบ้านติดอยู่กับบ้านของเขา(?)กําลังทําTaco สุดแสนจะอร',
    showName: 'bruh',
    id: 1,
  },
  {
    message:
      'เรื่องราวมีอยู่ว่าขณะท่ี CrazyDave เพื่อนบ้านของคุณซึ่งเขามีบ้านอยู่ติดกับบ้านคุณและคุณก็ มีบ้านติดอยู่กับบ้านของเขา(?)กําลังทําTaco สุดแสนจะอร',
    showName: 'Anos',
    id: 391,
  },
  {
    message:
      'abdfsdfcsd   hfj kshdjkfh sjkdh fjklsdh is one of the best thing to',
    showName: 'csdhr',
    id: 4,
  },
  {
    message: 'abdggggc',
    showName: 'bruh',
    id: 3,
  },
  {
    message: `ขออธิบายในส่วนของตรงนี้ว่า
\`for (int di : {-1, 0, 1}) {
  int ni = i + di;
  // do something
}\`
*BOLD* _Italic_ ~Strikethrough~`,
    showName: 'bruh',
    id: 3,
  },
  {
    message: 'abdggggc',
    showName: 'bruh',
    id: 3,
  },
]

const onlineUsers = ['Anos', 'bruh', 'ไม่ใช่ตอต่อต้อต๊อต๋อ']

const ChatMessage = (props: ChatMessageProps) => {
  const { message, showName, id, rating, repeated = false } = props
  const { user } = useAuth()
  const isOther = user?.id !== id
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
            {showName}
          </Text>
        )}
        <Text
          title={'timestamp'}
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
          {formatParser(message)}
        </Text>
      </Flex>
    </Flex>
  )
}

const formatter: Record<string, (token: string) => ReactNode> = {
  _: (token) => <Text as="i">{token}</Text>,
  '~': (token) => <Text as="s">{token}</Text>,
  '*': (token) => <Text as="strong">{token}</Text>,
  '`': (token) => (
    <Code
      color="inherit"
      bg={useColorModeValue('whiteAlpha.400', 'blackAlpha.300')}
    >
      {token}
    </Code>
  ),
}

const formatted = (token: string, format: string) => {
  return formatter[format]?.(token) ?? <Text as="p">{token}</Text>
}

const formatParser = (message: string) => {
  const tokens: ReactNode[] = []
  let token: string = ''
  let format: string = ''
  for (let i = 0; i < message.length; i++) {
    if (format) {
      if (message[i] === format) {
        tokens.push(formatted(token, format))
        format = ''
        token = ''
      } else {
        token += message[i]
      }
    } else if (message[i] in formatter) {
      tokens.push(token)
      format = message[i]
      token = ''
    } else {
      token += message[i]
    }
  }
  if (token) {
    tokens.push(token)
  }
  return tokens
}
