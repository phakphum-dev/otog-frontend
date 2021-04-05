import useSWR from 'swr'

import { Language } from 'prism-react-renderer'
import { Problem } from './Problem'
import { UserDto } from './User'
import { useInitialData } from '../hooks/useInitialData'
import { useAuth } from './AuthProvider'

export type Status = 'waiting' | 'grading' | 'accept' | 'reject'

export interface Submission {
  id: number
  user: UserDto
  timeUsed: number
  result: string
  score: number
  creationDate: string
  errmsg: string | null
  contestId: number | null
  status: Status
  language: Language
}

export type SubmissionWithProblem = Submission & {
  problem: Problem
}

export type SubmissionWithSourceCodeDto = SubmissionWithProblem & {
  sourceCode: string
}

export function useSubmissions(isOnlyMe: boolean) {
  const { user } = useAuth()
  return useSWR<SubmissionWithProblem[]>(
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
  return useSWR<SubmissionWithProblem>(
    isAuthenticated ? 'submission/latest' : null,
    {
      initialData,
    }
  )
}
