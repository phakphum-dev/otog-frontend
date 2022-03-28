import { useMemo } from 'react'

import { Container, ContainerProps } from '@chakra-ui/react'
import { useTheme } from '@chakra-ui/system'

import { Breakpoints, breakpoints } from '@src/theme'

type PageContainerProps = ContainerProps & {
  maxSize?: Breakpoints
}

export const PageContainer = ({
  maxSize = 'lg',
  ...props
}: PageContainerProps) => {
  const theme = useTheme()

  const maxW = useMemo(() => {
    const index = breakpoints.findIndex((breakpoint) => breakpoint === maxSize)
    const length = index === -1 ? breakpoints.length : index + 1
    const restBreakpoints = breakpoints.slice(0, length)
    return restBreakpoints.reduce(
      (result, key) => ({ ...result, [key]: theme.sizes.container[key] }),
      {}
    )
  }, [maxSize, theme.sizes.container])

  return <Container flex={1} maxW={maxW} {...props} />
}
