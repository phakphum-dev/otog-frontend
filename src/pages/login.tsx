import { CenteredCard, LoginForm } from '@src/components/Login'
import { useRouter } from 'next/router'
import { getServerSideCookies } from '@src/api'
import { GetServerSideProps } from 'next'
import { Center, Circle, SquareProps } from '@chakra-ui/react'

export default function LoginPage() {
  const router = useRouter()
  return (
    <>
      <Center flex={1}>
        <CenteredCard>
          <LoginForm onSuccess={() => router.replace('/contest')} />
        </CenteredCard>
      </Center>

      <Ball boxSize={120} l={100} t={-140} />
      <Ball boxSize={90} l={-130} />
      <Ball boxSize={100} l={40} t={165} />
      <Ball boxSize={40} l={-200} t={-225} />
      <Ball boxSize={25} l={225} t={115} />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const serverSideCookies = getServerSideCookies(context)
  if (serverSideCookies.props.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/contest',
      },
    }
  }
  return serverSideCookies
}

const Ball = (
  props: SquareProps & { boxSize: number; l?: number; t?: number }
) => {
  const { boxSize, l = 0, t = 0, ...rest } = props
  return (
    <Circle
      pos="absolute"
      zIndex={1}
      size={`${boxSize}px`}
      boxShadow="0 0 1rem 0 rgba(0, 0, 0, 0.25)"
      bg="radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4))"
      sx={{
        backdropFilter: 'blur(10px)',
        top: `calc(50% - ${boxSize / 2}px + ${t}px)`,
        left: `calc(50% - ${boxSize / 2}px + ${l}px)`,
      }}
      {...rest}
    />
  )
}
