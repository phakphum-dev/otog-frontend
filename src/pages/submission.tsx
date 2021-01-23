import { Container } from '@chakra-ui/react'
import { SubmissionTable } from '@src/components/SubmissionTable'

export default function SubmissionPage() {
  return (
    <Container>
      <SubmissionTable />
    </Container>
  )
}
export { getServerSideProps } from '@src/theme/ColorMode'
