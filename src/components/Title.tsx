import Icon from '@chakra-ui/icon'
import { Flex, FlexProps, Heading, HStack, TextProps } from '@chakra-ui/layout'
import { forwardRef } from '@chakra-ui/system'
import { ForwardedRef } from 'react'
import { IconType } from 'react-icons'

interface TitleProps extends TextProps {
  icon: IconType
}

export const Title = forwardRef(
  (props: TitleProps, ref: ForwardedRef<HTMLHeadingElement>) => {
    const { icon, children, noOfLines, ...rest } = props
    return (
      <Heading {...rest} ref={ref}>
        <HStack>
          <Icon as={icon} />
          <Heading noOfLines={noOfLines}>{children}</Heading>
        </HStack>
      </Heading>
    )
  }
)

export function TitleLayout(props: FlexProps) {
  return (
    <Flex justify="space-between" align="flex-end" mt={8} mb={4} {...props} />
  )
}
