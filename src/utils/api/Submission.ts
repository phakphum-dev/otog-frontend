import useSWR from 'swr'

import { Language } from 'prism-react-renderer'
import { Problem } from './Problem'
import { User } from './User'
import { useInitialData } from '@src/utils/hooks/useInitialData'
import { useAuth } from './AuthProvider'

export type Status = 'waiting' | 'grading' | 'accept' | 'reject'

export interface Submission {
  id: number
  user: User
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

export type SubmissionWithSourceCode = SubmissionWithProblem & {
  sourceCode: string
}

export function useAllSubmissions() {
  return useSWR<SubmissionWithProblem[]>('submission')
}

export function useSubmissions() {
  const { user } = useAuth()
  return useSWR<SubmissionWithProblem[]>(user && `submission/user/${user.id}`)
}

export function useSubmission(submissionId: number) {
  return useSWR<SubmissionWithSourceCode>(
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
