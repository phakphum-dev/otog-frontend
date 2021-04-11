import { Button, ButtonProps } from '@chakra-ui/button'
import { AspectRatio, Heading, Stack, VStack } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'
import { PageContainer } from '@src/components/PageContainer'
import { ProblemTable, FilterFunction } from '@src/components/ProblemTable'
import { Title } from '@src/components/Title'
import { useAuth } from '@src/utils/api/AuthProvider'
import { ProblemWithSubmission, useProblems } from '@src/utils/api/Problem'
import { Dispatch, SetStateAction, useState } from 'react'
import { FaPuzzlePiece } from 'react-icons/fa'

export default function ProblemPage() {
  const { data: problems } = useProblems()
  const { isAuthenticated } = useAuth()
  const [filter, setFilter] = useState<FilterFunction>(
    () => filterButton[0].filter
  )

  return (
    <PageContainer dense>
      <Title icon={FaPuzzlePiece}>โจทย์</Title>
      {isAuthenticated && problems && (
        <Buttons setFilter={setFilter} problems={problems} />
      )}
      <ProblemTable filter={filter} />
    </PageContainer>
  )
}

export interface ButtonsProps {
  problems: ProblemWithSubmission[]
  setFilter: Dispatch<SetStateAction<FilterFunction>>
}

export function Buttons(props: ButtonsProps) {
  const { problems, setFilter } = props
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
        <OtogButton
          key={props.colorScheme}
          onClick={() => setFilter(() => filter)}
          {...props}
        >
          {problems.filter(filter).length}
        </OtogButton>
      ))}
    </Stack>
  ) : null
}

const aDay = 24 * 60 * 60 * 1000
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
    filter: (problem) => !problem.submission,
    colorScheme: 'btn_orange',
    label: 'ยังไม่ส่ง',
  },
  {
    filter: (problem) =>
      Date.now() - new Date(problem.recentShowTime).getTime() < aDay,
    colorScheme: 'btn_blue',
    label: 'โจทย์วันนี้',
  },
]

export { getServerSideProps } from '@src/utils/api'
