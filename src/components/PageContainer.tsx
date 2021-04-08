import { Container, ContainerProps, useToken } from '@chakra-ui/react'

export type PageContainerProps = ContainerProps & { dense?: boolean }

export function PageContainer({ dense = false, ...props }: PageContainerProps) {
  const maxWidth = useToken('sizes', 'container')
  return (
    <Container maxWidth={dense ? maxWidth.sm : maxWidth} flex={1} {...props} />
  )
}
