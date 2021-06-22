import { Button, ButtonProps } from '@chakra-ui/button'
import { AspectRatio, Heading, Stack, VStack } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'
import { Skeleton } from '@chakra-ui/skeleton'
import { PageContainer } from '@src/components/PageContainer'
import { ProblemTable, FilterFunction } from '@src/components/ProblemTable'
import { Title, TitleLayout } from '@src/components/Title'
import { useAuth } from '@src/api/AuthProvider'
import { useProblems } from '@src/hooks/useProblem'
import { ONE_DAY } from '@src/hooks/useTimer'
import Head from 'next/head'
import { Dispatch, memo, SetStateAction, useState } from 'react'
import { FaPuzzlePiece } from 'react-icons/fa'

export default function ProblemPage() {
  const { isAuthenticated } = useAuth()
  const [filter, setFilter] = useState<FilterFunction>(
    () => filterButton[0].filter
  )

  return (
    <PageContainer dense>
      <Head>
        <title>Problem | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaPuzzlePiece}>โจทย์</Title>
      </TitleLayout>
      {isAuthenticated && <Buttons setFilter={setFilter} />}
      <ProblemTable filter={filter} />
    </PageContainer>
  )
}

export interface ButtonsProps {
  setFilter: Dispatch<SetStateAction<FilterFunction>>
}

export const Buttons = memo((props: ButtonsProps) => {
  const { setFilter } = props
  const { data: problems } = useProblems()
  const display = useBreakpointValue({ base: false, sm: true })
  const OtogButton = ({
    label,
    children,
    ...props
  }: ButtonProps & { label: string }) => (
    <AspectRatio flex={1} ratio={5 / 4}>
      <Button rounded="lg" mb={4} {...props}>
        <VStack>
          <Heading as="h6" fontSize="md">
            {label}
          </Heading>
          <Heading as="h3">{children}</Heading>
        </VStack>
      </Button>
    </AspectRatio>
  )

  return display ? (
    <Stack direction="row" mb={4}>
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
  ) : null
})

const filterButton: {
  filter: FilterFunction
  colorScheme: string
  label: string
}[] = [
  {
    filter: () => true,
    colorScheme: 'gray',
    label: 'ทั้งหมด',
  },
  {
    filter: (problem) => problem.submission?.status === 'accept',
    colorScheme: 'btn_green',
    label: 'ผ่านแล้ว',
  },
  {
    filter: (problem) => problem.submission?.status === 'reject',
    colorScheme: 'btn_red',
    label: 'ยังไม่ผ่าน',
  },
  {
    filter: (problem) => !problem.submission?.id,
    colorScheme: 'btn_orange',
    label: 'ยังไม่ส่ง',
  },
  {
    filter: (problem) =>
      problem.show &&
      Date.now() - new Date(problem.recentShowTime).getTime() < ONE_DAY,
    colorScheme: 'btn_blue',
    label: 'โจทย์วันนี้',
  },
]

export { getNotFound as getServerSideProps } from '@src/api'
// export { getServerSideCookies as getServerSideProps } from '@src/api'
