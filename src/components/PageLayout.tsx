import { Flex } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'
import { Footer } from './Footer'
import { NavBar } from './NavBar'

export const PageLayout = (props: PropsWithChildren<{}>) => {
  const { children } = props
  const { pathname } = useRouter()
  const isLogin = pathname === '/login'

  return (
    <Flex
      direction="column"
      minH="100vh"
      bg={
        isLogin
          ? 'linear-gradient(60deg, #ec88c2 10%,  #ff851b 90%)'
          : undefined
      }
      pos="relative"
    >
      {!isLogin && <NavBar />}
      {children}
      {/* <Chat /> */}
      {!isLogin && <Footer />}
    </Flex>
  )
}
