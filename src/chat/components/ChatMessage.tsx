import NextLink from 'next/link'
import { Children, ReactElement, cloneElement, memo } from 'react'

import { Message } from '../types'

import {
  Avatar,
  Box,
  Code,
  Flex,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'

import { useAuth } from '@src/context/AuthContext'
import { useProfilePic } from '@src/profile/useProfilePic'
import { Link } from '@src/ui/Link'
import { toThDate } from '@src/utils/time'

export interface ChatMessageProps {
  messageAbove: Message | undefined
  messageData: Message
  messageBelow: Message | undefined
}

export const ChatMessage = memo(
  (props: ChatMessageProps) => {
    const {
      messageAbove,
      messageData: { message, user: sender, creationDate },
      messageBelow,
    } = props

    const { user } = useAuth()
    const isSelf = user?.id === sender.id
    const isOther = !isSelf
    const shouldDisplayDate =
      !messageAbove ||
      new Date(messageAbove.creationDate).getDay() !==
        new Date(creationDate).getDay()
    const groupedWithTop =
      !shouldDisplayDate && messageAbove?.user.id === sender.id
    const isSameDateAsBelow =
      !!messageBelow &&
      new Date(messageBelow.creationDate).getDay() ===
        new Date(creationDate).getDay()
    const groupedWithBottom =
      isSameDateAsBelow && messageBelow?.user.id === sender.id
    const displayName = isOther && !groupedWithTop
    const displayAvatar = isOther && !groupedWithBottom
    const isEmoji = emojiPattern.test(message) && message.length <= 12
    const bg = useColorModeValue('gray.100', 'gray.800')
    const borderColor = useColorModeValue('gray.100', 'whiteAlpha.300')

    return (
      <div>
        {shouldDisplayDate && (
          <Flex justify="center" fontSize="xs" color="gray.500" mt={2}>
            {new Date(creationDate).toLocaleDateString('th-TH', {
              minute: '2-digit',
              hour: '2-digit',
              day: 'numeric',
              month: 'short',
            })}
          </Flex>
        )}
        <Flex
          direction={isOther ? 'row' : 'row-reverse'}
          mt={groupedWithTop ? 0.5 : 2}
          align="flex-end"
        >
          {displayAvatar ? (
            <SmallAvatar userId={sender.id} />
          ) : (
            isOther && <Box minW={6} mr={1} />
          )}
          <VStack align="flex-start" spacing={0}>
            {displayName && (
              <Text
                fontSize="xs"
                color="gray.500"
                px={1}
                maxW={270}
                noOfLines={3}
              >
                {sender.showName}
              </Text>
            )}
            {isEmoji ? (
              <Text
                title={toThDate(creationDate)}
                fontSize="4xl"
                {...{ [isSelf ? 'ml' : 'mr']: 2 }}
                whiteSpace="pre-wrap"
                wordBreak="break-word"
              >
                {message}
              </Text>
            ) : (
              <Text
                title={toThDate(creationDate)}
                px={2}
                py={1}
                rounded={16}
                {...{
                  [isSelf ? 'ml' : 'mr']: 2,
                  ...(groupedWithTop && {
                    [isSelf ? 'roundedTopRight' : 'roundedTopLeft']: 6,
                  }),
                  ...(groupedWithBottom && {
                    [isSelf ? 'roundedBottomRight' : 'roundedBottomLeft']: 6,
                  }),
                }}
                borderWidth="1px"
                bg={isSelf ? 'otog' : bg}
                color={isSelf ? 'white' : undefined}
                borderColor={isSelf ? 'otog' : borderColor}
                whiteSpace="pre-wrap"
                wordBreak="break-word"
              >
                {formatParser(message)}
              </Text>
            )}
          </VStack>
        </Flex>
      </div>
    )
  },
  (prevProps, nextProps) =>
    prevProps.messageAbove?.id === nextProps.messageAbove?.id &&
    prevProps.messageData.id === nextProps.messageData.id &&
    prevProps.messageBelow?.id === nextProps.messageBelow?.id
)

export const emojiPattern = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+$/

const SmallAvatar = ({ userId }: { userId: number }) => {
  const { url } = useProfilePic(userId, true)
  return (
    <NextLink href={`/profile/${userId}`} passHref>
      <Avatar as="a" size="xs" mr={1} src={url} />
    </NextLink>
  )
}

const MessageCode = (token: string) => (
  <Code color="inherit" bg={useColorModeValue('transparent', 'blackAlpha.300')}>
    {token}
  </Code>
)

const matcher: Record<
  string,
  { match: string; formatter: (token: string) => ReactElement }
> = {
  _: { match: '_', formatter: (token) => <i>{token}</i> },
  '~': { match: '~', formatter: (token) => <s>{token}</s> },
  '*': { match: '*', formatter: (token) => <b>{token}</b> },
  '`': {
    match: '`',
    formatter: MessageCode,
  },
  '[': {
    match: ']',
    formatter: (token) => (
      <Link href={token} isExternal className="underline text-inherit">
        {token}
      </Link>
    ),
  },
}

const formatted = (token: string, format: string) => {
  return matcher[format]?.formatter(token) ?? <>{token}</>
}

const formatParser = (message: string) => {
  const tokens: ReactElement[] = []
  let token = ''
  let format = ''
  for (let i = 0; i < message.length; i++) {
    if (format && matcher[format].match === message[i]) {
      tokens.push(formatted(token.slice(1), format))
      format = ''
      token = ''
    } else if (!format && message[i] in matcher) {
      tokens.push(<>{token}</>)
      format = message[i]
      token = message[i]
    } else {
      token += message[i]
    }
  }
  if (token) {
    tokens.push(<>{token}</>)
  }
  return Children.map(tokens, (child, index) =>
    cloneElement(child, { key: index })
  )
}
