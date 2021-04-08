import { useToken } from '@chakra-ui/system'
import { PageContainer } from '@src/components/PageContainer'
import { ProblemTable } from '@src/components/ProblemTable'
import { Title } from '@src/components/Title'
import { FaPuzzlePiece } from 'react-icons/fa'

export default function ProblemPage() {
  const maxWidth = useToken('sizes', 'container')
  return (
    <PageContainer maxWidth={maxWidth.sm}>
      <Title icon={FaPuzzlePiece}>โจทย์</Title>
      <ProblemTable />
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
