import { Container, ContainerProps } from '@chakra-ui/react'
import { useTheme } from '@chakra-ui/system'

export type PageContainerProps = ContainerProps & { dense?: boolean }

export const PageContainer = ({
  dense = false,
  ...props
}: PageContainerProps) => {
  const theme = useTheme()
  const maxWidth = theme.sizes.container
  return (
    <Container maxWidth={dense ? maxWidth.sm : maxWidth} flex={1} {...props} />
  )
}
