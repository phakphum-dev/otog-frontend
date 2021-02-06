import { GetServerSideProps } from 'next'
import { getServerSideProps as getColorModeProps } from '@src/theme/ColorMode'

import { PageContainer } from '@src/components/PageContainer'
import { SubmissionTable } from '@src/components/SubmissionTable'

import { getSubmissions } from '@src/utils/api/Submission'

export default function SubmissionPage() {
  return (
    <PageContainer>
      <SubmissionTable />
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const colorModeProps = await getColorModeProps(context)
  try {
    const submissions = await getSubmissions()
    return { props: { initialData: { submissions }, ...colorModeProps } }
  } catch (e) {
    console.log(e)
  }
  return { props: colorModeProps }
}
