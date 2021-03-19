import { Container } from '@chakra-ui/react'
import { PageContainer } from '@src/components/PageContainer'
import { ProblemTable } from '@src/components/ProblemTable'

export default function ProblemPage() {
  return (
    <PageContainer>
      <Container>
        <ProblemTable />
      </Container>
    </PageContainer>
  )
}

export { getServerSideColorMode as getServerSideProps } from '@src/theme/ColorMode'
