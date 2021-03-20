import useSWR from 'swr'

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

export function useSubmissions() {
  return useSWR<SubmissionDto[]>('submission')
}

export function useSubmission(submissionId: number) {
  return useSWR<SubmissionWithSourceCodeDto>(
    submissionId === 0 ? null : `submission/${submissionId}`
  )
}
