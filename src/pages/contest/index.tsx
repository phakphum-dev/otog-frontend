import { Center, Heading, Stack, VStack } from '@chakra-ui/layout'
import { PageContainer } from '@src/components/PageContainer'
import { TaskCard } from '@src/components/TaskCard'
import { Title } from '@src/components/Title'
import { FaTrophy } from 'react-icons/fa'

import { getServerSideFetch } from '@src/utils/api'
import { GetServerSideProps } from 'next'
import { Contest, useCurrentContest } from '@src/utils/api/Contest'
import { Button } from '@chakra-ui/button'
import NextLink from 'next/link'

export interface ContestPageProps {
  initialData: Contest | null
}

export default function ContestPage(props: ContestPageProps) {
  const { initialData } = props
  const { data: currentContest } = useCurrentContest(initialData)
  return (
    <PageContainer dense>
      {currentContest ? (
        <>
          <Title icon={FaTrophy}>แข่งขัน</Title>
          <Stack spacing={6}>
            {currentContest.problems.map((prob) => (
              <TaskCard
                contestId={currentContest.id}
                key={prob.id}
                problem={prob}
              />
            ))}
          </Stack>
        </>
      ) : (
        <Center mt={48}>
          <VStack spacing={4}>
            <Heading>ยังไม่มีการแข่งขัน</Heading>
            <NextLink href="/contest/history">
              <Button>ประวัติการแข่งขัน</Button>
            </NextLink>
          </VStack>
        </Center>
      )}
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return getServerSideFetch<Contest | null>('contest/now', context)
}
