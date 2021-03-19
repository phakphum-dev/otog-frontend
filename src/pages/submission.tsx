import { PageContainer } from '@src/components/PageContainer'
import { SubmissionTable } from '@src/components/SubmissionTable'

export default function SubmissionPage() {
  return (
    <PageContainer>
      <SubmissionTable />
    </PageContainer>
  )
}

export { getServerSideColorMode as getServerSideProps } from '@src/theme/ColorMode'
