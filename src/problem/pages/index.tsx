import Head from 'next/head'
import { Dispatch, SetStateAction, memo, useState } from 'react'
import { FaPuzzlePiece } from 'react-icons/fa'

import { ProblemWithSubmission } from '../types'

import { AspectRatio, Heading, Stack, VStack } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/skeleton'

import { AnnouncementCarousel } from '@src/announcement/components/AnnouncementCarousel'
import { getAnnouncements } from '@src/announcement/queries'
import { ClientOnly } from '@src/components/ClientOnly'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useAuth } from '@src/context/AuthContext'
import { withCookies } from '@src/context/HttpClient'
import { FilterFunction, ProblemTable } from '@src/problem/ProblemTable'
import { useProblems } from '@src/problem/queries'
import { Button, ButtonProps } from '@src/ui/Button'
import { ONE_DAY } from '@src/utils/time'

export default function ProblemPage() {
  const { isAuthenticated } = useAuth()
  const [filter, setFilter] = useState<FilterFunction>(
    () => filterButton[0].filter
  )

  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Problem | OTOG</title>
      </Head>
      <AnnouncementCarousel />
      <TitleLayout>
        <Title icon={FaPuzzlePiece}>โจทย์</Title>
      </TitleLayout>
      {isAuthenticated && <Buttons setFilter={setFilter} />}
      <ClientOnly>
        <ProblemTable filter={filter} />
      </ClientOnly>
    </PageContainer>
  )
}

export interface ButtonsProps {
  setFilter: Dispatch<SetStateAction<FilterFunction>>
}

export const Buttons = memo((props: ButtonsProps) => {
  const { setFilter } = props
  const { data: problems } = useProblems()

  return (
    <Stack direction="row" mb={4} spacing={{ base: 2, md: 3 }}>
      {filterButton.map(({ filter, ...props }) => (
        <Skeleton
          flex={1}
          rounded="lg"
          isLoaded={!!problems}
          key={props.colorScheme}
        >
          <OtogButton
            key={props.colorScheme}
            onClick={() => setFilter(() => filter)}
            {...props}
          >
            {problems?.filter(filter).length}
          </OtogButton>
        </Skeleton>
      ))}
    </Stack>
  )
})

const OtogButton = ({
  label,
  children,
  ...props
}: ButtonProps & { label: string }) => (
  <AspectRatio flex={1} ratio={5 / 4}>
    <Button className="rounded-lg" {...props}>
      <VStack spacing={{ base: 0, sm: 2 }}>
        <Heading
          as="h6"
          fontSize={{ base: 'md', md: 'lg' }}
          display={{ base: 'none', sm: 'block' }}
        >
          {label}
        </Heading>
        <Heading as="h3" fontSize={{ base: '3xl', md: '4xl' }}>
          {children}
        </Heading>
      </VStack>
    </Button>
  </AspectRatio>
)

const filterButton = [
  {
    filter: () => true,
    colorScheme: 'gray',
    label: 'ทั้งหมด',
  },
  {
    filter: (problem: ProblemWithSubmission) =>
      problem.submission?.status === 'accept',
    colorScheme: 'otog-green',
    label: 'ผ่านแล้ว',
  },
  {
    filter: (problem: ProblemWithSubmission) =>
      problem.submission?.status === 'reject',
    colorScheme: 'otog-red',
    label: 'ยังไม่ผ่าน',
  },
  {
    filter: (problem: ProblemWithSubmission) => !problem.submission?.id,
    colorScheme: 'otog-orange',
    label: 'ยังไม่ส่ง',
  },
  {
    filter: (problem: ProblemWithSubmission) =>
      problem.show &&
      Date.now() - new Date(problem.recentShowTime).getTime() < ONE_DAY,
    colorScheme: 'otog-blue',
    label: 'โจทย์วันนี้',
  },
] as const

export const getServerSideProps = withCookies(async () => {
  const announcement = getAnnouncements()
  return {
    props: {
      fallback: {
        announcement: await announcement,
      },
    },
  }
})
