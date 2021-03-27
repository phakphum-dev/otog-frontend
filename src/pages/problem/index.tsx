import { Container } from '@chakra-ui/react'
import { PageContainer } from '@src/components/PageContainer'
import { ProblemTable } from '@src/components/ProblemTable'
import { Title } from '@src/components/Title'
import { FaPuzzlePiece } from 'react-icons/fa'

export default function ProblemPage() {
  return (
    <PageContainer>
      <Container>
        <Title icon={FaPuzzlePiece}>โจทย์</Title>
        <ProblemTable />
      </Container>
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
