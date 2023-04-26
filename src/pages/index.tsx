import Head from 'next/head'
import Image from 'next/image'
import NextLink from 'next/link'

import ComputerImage from '../../public/computer.svg'

import { withSession } from '@src/api/withSession'
import { PageContainer } from '@src/components/layout/PageContainer'
import { OFFLINE_MODE } from '@src/config'
import { Button } from '@src/ui/Button'

export default function HomePage() {
  return (
    <PageContainer className="flex items-center justify-center">
      <Head>
        <title>Login | OTOG</title>
      </Head>
      <div className="flex flex-col gap-16 md:flex-row md:pb-16">
        <div className="flex flex-1 flex-col gap-6">
          <h1 className="text-5xl font-bold">
            Become a god of Competitive Programming
          </h1>
          <div className="text-md text-gray-500">
            Code and Create algorithms efficiently.
          </div>
          <div className="flex gap-4">
            <NextLink href="/register" passHref legacyBehavior>
              <Button as="a" className="w-[100px]" colorScheme="otog">
                Sign Up
              </Button>
            </NextLink>
            <NextLink href="/login" passHref legacyBehavior>
              <Button as="a" className="w-[100px]" variant="outline">
                Sign in
              </Button>
            </NextLink>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Image src={ComputerImage} alt="computer image" />
        </div>
      </div>
    </PageContainer>
  )
}

export const getServerSideProps = withSession(async (session) => {
  if (OFFLINE_MODE) {
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
    }
  }
  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: '/problem',
      },
    }
  }
  return { props: {} }
})
