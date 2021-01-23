import { Container } from '@chakra-ui/react'
import { ProblemTable } from '@src/components/ProblemTable'

export default function ProblemPage() {
  return (
    <Container>
      <ProblemTable />
    </Container>
  )
}

export { getServerSideProps } from '@src/theme/ColorMode'
