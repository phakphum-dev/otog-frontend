import { GetServerSideProps } from 'next'
import { getServerSideProps as getColorModeProps } from '@src/theme/ColorMode'

import { PageContainer } from '@src/components/PageContainer'
import { ProblemTable } from '@src/components/ProblemTable'

import { get } from '@src/utils/api'
import { ProblemDto } from '@src/utils/api/Problem'

interface ProblemPageProps {
  initialProblems: ProblemDto[]
}

export default function ProblemPage(props: ProblemPageProps) {
  return (
    <PageContainer>
      <ProblemTable initialProblems={props.initialProblems} />
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const colorModeProps = await getColorModeProps(context)
  const initialProblems = await get('problem')
  return { props: { initialProblems, ...colorModeProps } }
}
