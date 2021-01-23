import { Container } from '@chakra-ui/react'
import { withColorMode } from '@src/theme/ColorMode'
import { ProblemTable } from '@src/components/ProblemTable'

function ProblemPage() {
  return (
    <Container>
      <ProblemTable />
    </Container>
  )
}

export default withColorMode(ProblemPage)
export { getServerSideProps } from '@src/theme/ColorMode'
