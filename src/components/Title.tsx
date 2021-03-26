import Icon from '@chakra-ui/icon'
import { Heading, HStack, Text, TextProps } from '@chakra-ui/layout'
import { IconType } from 'react-icons'

interface TitleProps extends TextProps {
  icon: IconType
}

export function Title(props: TitleProps) {
  const { icon, ...rest } = props
  return (
    <Heading my={4}>
      <HStack>
        <Icon as={icon} />
        <Text {...rest} />
      </HStack>
    </Heading>
  )
}
