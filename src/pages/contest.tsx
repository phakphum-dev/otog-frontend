import { Stack } from '@chakra-ui/layout'
import { PageContainer } from '@src/components/PageContainer'
import { TaskCard } from '@src/components/TaskCard'
import { Title } from '@src/components/Title'
import { useProblem } from '@src/utils/api/Problem'
import { FaTrophy } from 'react-icons/fa'

export default function ContestPage() {
  const { data: problem } = useProblem('470')
  return (
    <PageContainer dense>
      <Title icon={FaTrophy}>แข่งขัน</Title>
      <Stack spacing={6}>
        {problem && (
          <>
            <TaskCard problem={problem} />
            <TaskCard problem={problem} />
            <TaskCard problem={problem} />
          </>
        )}
      </Stack>
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
