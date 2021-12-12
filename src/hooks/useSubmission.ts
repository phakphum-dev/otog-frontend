import useSWR, {
  mutate,
  SWRInfiniteResponseInterface,
  useSWRInfinite,
} from 'swr'

import { Language } from 'prism-react-renderer'
import { Problem } from './useProblem'
import { User } from './useUser'
import { useInitialData } from '@src/hooks/useInitialData'
import { useAuth } from '@src/api/AuthProvider'
import { isGrading } from './useStatusColor'
import { ONE_SECOND } from './useTimer'
import { useEffect, useMemo } from 'react'

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
    },
    { revalidateOnMount: true, revalidateAll: true }
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
    },
    { revalidateOnMount: true, revalidateAll: true }
  )
}

export function useSubmissionInfinite(
  submissionData: SWRInfiniteResponseInterface<SubmissionWithProblem[], any>
) {
  const { data: submissionsList, setSize, isValidating, size } = submissionData
  useEffect(
    () => () => {
      setSize(1)
    },
    []
  )
  const submissions = useMemo(
    () => submissionsList?.flatMap((submissions) => submissions),
    [submissionsList]
  )
  const hasMore =
    isValidating || (submissionsList && submissionsList.length === size)
  const loadMore = () => {
    setSize((size) => size + 1)
  }
  return {
    ...submissionData,
    submissions,
    hasMore,
    loadMore,
  }
}

export function useSubmissionRow(initialSubmission: SubmissionWithProblem) {
  return useSWR<SubmissionWithProblem>(
    isGrading(initialSubmission) ? `/submission/${initialSubmission.id}` : null,
    {
      initialData: initialSubmission,
      revalidateOnMount: true,
      onSuccess: (data, key) => {
        if (isGrading(data)) {
          setTimeout(() => mutate(key), ONE_SECOND)
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
      revalidateOnMount: true,
    }
  )
}

export function useProblemSubmission(problemId: number) {
  const { isAuthenticated } = useAuth()
  return useSWR<SubmissionWithSourceCode>(
    isAuthenticated && problemId
      ? `submission/problem/${problemId}/latest`
      : null,
    {
      revalidateOnFocus: false,
      onSuccess: (data, key) => {
        if (isGrading(data)) {
          setTimeout(() => mutate(key), ONE_SECOND)
        }
      },
    }
  )
}
