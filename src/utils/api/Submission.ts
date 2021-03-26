import useSWR from 'swr'

import { Language } from 'prism-react-renderer'
import { ProblemDto } from './Problem'
import { UserDto } from './User'
import { useInitialData } from '../hooks/useInitialData'
import { useAuth } from './AuthProvider'

export interface SubmissionDto {
  id: number
  problem: ProblemDto
  user: UserDto
  timeUsed: number
  result: string
  score: number
  creationDate: string
  errmsg: string | null
  contestId: number | null
  isGrading: boolean
  language: Language
}

export type SubmissionWithSourceCodeDto = SubmissionDto & { sourceCode: string }

export function useSubmissions(isOnlyMe: boolean) {
  const { user } = useAuth()
  return useSWR<SubmissionDto[]>(
    isOnlyMe && user ? `submission/user/${user.id}` : 'submission'
  )
}

export function useSubmission(submissionId: number) {
  return useSWR<SubmissionWithSourceCodeDto>(
    submissionId === 0 ? null : `submission/${submissionId}`
  )
}

export function useLatestSubmission() {
  const { isAuthenticated } = useAuth()
  const initialData = useInitialData()
  return useSWR<SubmissionDto>(isAuthenticated ? 'submission/latest' : null, {
    initialData,
  })
}
