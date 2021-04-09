import Icon from '@chakra-ui/icon'
import { Heading, HStack, Text, TextProps } from '@chakra-ui/layout'
import { IconType } from 'react-icons'

interface TitleProps extends TextProps {
  icon: IconType
}

export function Title(props: TitleProps) {
  const { icon, children, ...rest } = props
  return (
    <Heading mt={8} mb={6} {...rest}>
      <HStack>
        <Icon as={icon} />
        <Text children={children} />
      </HStack>
    </Heading>
  )
}
