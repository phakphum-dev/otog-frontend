import useSWR, { mutate, useSWRInfinite } from 'swr'

import { Language } from 'prism-react-renderer'
import { Problem } from './Problem'
import { User } from './User'
import { useInitialData } from '@src/utils/hooks/useInitialData'
import { useAuth } from './AuthProvider'
import { isGrading } from '../hooks/useStatusColor'

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
  return useSWRInfinite<SubmissionWithProblem[]>(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.length) return null

      // first page, we don't have `previousPageData`
      if (pageIndex === 0 || !previousPageData) return 'submission'

      // add the cursor to the API endpoint
      return `submission?offset=${
        previousPageData[previousPageData?.length - 1].id
      }`
    }
  )
}

export function useSubmissions() {
  const { user } = useAuth()
  return useSWRInfinite<SubmissionWithProblem[]>(
    (pageIndex, previousPageData) => {
      if (!user) return null

      // reached the end
      if (previousPageData && !previousPageData.length) return null

      // first page, we don't have `previousPageData`
      if (pageIndex === 0 || !previousPageData)
        return `submission/user/${user.id}`

      // add the cursor to the API endpoint
      return `submission/user/${user.id}?offset=${
        previousPageData[previousPageData?.length - 1].id
      }`
    }
  )
}

export function useSubmissionRow(initialSubmission: SubmissionWithProblem) {
  return useSWR<SubmissionWithProblem>(
    isGrading(initialSubmission) ? `/submission/${initialSubmission.id}` : null,
    {
      initialData: initialSubmission,
      revalidateOnMount: true,
      onSuccess: (data, key) => {
        if (isGrading(data)) {
          setTimeout(() => mutate(key), 1000)
        }
      },
    }
  )
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

export function useProblemSubmission(problemId: number) {
  return useSWR<SubmissionWithSourceCode>(
    problemId ? `submission/problem/${problemId}/latest` : null,
    {
      revalidateOnFocus: false,
      onSuccess: (data, key) => {
        if (isGrading(data)) {
          setTimeout(() => mutate(key), 1000)
        }
      },
    }
  )
}
