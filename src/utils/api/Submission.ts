import useSWR from 'swr'
import { get } from '.'
import { useInitialData } from '@src/utils/hooks/useInitialData'

import { Language } from 'prism-react-renderer'
import { ProblemDto } from './Problem'
import { UserDto } from './User'

export interface SubmissionDto {
  id: number
  problem: Partial<ProblemDto>
  user: UserDto
  timeUsed: number
  result: string
  score: number
  timeSent: number
  errmsg: string | null
  contestId: number | null
  isGrading: boolean
  language: Language
}

export type SubmissionWithSourceCodeDto = SubmissionDto & { sourceCode: string }

export function getSubmissions() {
  return get<SubmissionDto[]>('submission')
}
export function useSubmissions() {
  const { submissions: initialData } = useInitialData()
  return useSWR<SubmissionDto[]>('submission', { initialData })
}

const initialSubmission: SubmissionWithSourceCodeDto = {
  id: 0,
  problem: { id: 0, name: '', timeLimit: 0, memory: 0 },
  user: { showName: '' },
  timeUsed: 0,
  result: '',
  score: 0,
  language: 'c',
  timeSent: 0,
  errmsg: null,
  contestId: null,
  isGrading: false,
  sourceCode: '',
}

export function useSubmission(submissionId: number) {
  return useSWR<SubmissionWithSourceCodeDto>(
    submissionId === 0 ? null : `submission/${submissionId}`,
    { initialData: initialSubmission }
  )
}
