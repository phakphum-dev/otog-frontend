import { Container, ContainerProps, useToken } from '@chakra-ui/react'

export function PageContainer(props: ContainerProps) {
  const maxWidth = useToken('sizes', 'container')
  return <Container maxWidth={maxWidth} flex={1} {...props} />
}
