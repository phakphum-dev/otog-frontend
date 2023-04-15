import { useCallback, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite'

import { isGrading } from '../theme/useStatusColor'
import { ONE_SECOND } from '../utils/time'
import {
  Submission,
  SubmissionWithProblem,
  SubmissionWithSourceCode,
} from './types'

import { api } from '@src/api'
import { useUserData } from '@src/context/UserContext'

export function useAllSubmissions() {
  return useSWRInfinite<SubmissionWithProblem[]>(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData?.length === 0) return null

      // first page, we don't have `previousPageData`
      if (pageIndex === 0 || !previousPageData) return 'submission'

      // add the cursor to the API endpoint
      return `submission?offset=${
        previousPageData[previousPageData.length - 1].id
      }`
    },
    { fallbackData: [] }
  )
}

export function useSubmissions(userId?: number) {
  const { user } = useUserData()
  return useSWRInfinite<SubmissionWithProblem[]>(
    (pageIndex, previousPageData) => {
      if (!user) return null

      // reached the end
      if (previousPageData?.length === 0) return null

      const id = userId ?? user.id
      // first page, we don't have `previousPageData`
      if (pageIndex === 0 || !previousPageData) return `submission/user/${id}`

      // add the cursor to the API endpoint
      return `submission/user/${id}?offset=${
        previousPageData[previousPageData.length - 1].id
      }`
    },
    { fallbackData: [] }
  )
}

export function useInfiniteSubmissionTable(
  submissionsResponse: SWRInfiniteResponse<SubmissionWithProblem[], any>
) {
  const { data: submissionsList, setSize, isValidating } = submissionsResponse
  useEffect(
    () => () => {
      setSize(1)
    },
    [setSize]
  )
  const hasMore =
    isValidating ||
    (submissionsList &&
      submissionsList.length > 0 &&
      submissionsList.at(-1)!.length > 0)
  const loadMore = useCallback(() => {
    setSize((size) => size + 1)
  }, [setSize])
  return {
    submissionsList,
    hasMore,
    loadMore,
  }
}

export function useSubmissionRow(initialSubmission: SubmissionWithProblem) {
  return useSWR<SubmissionWithProblem>(
    isGrading(initialSubmission) ? `submission/${initialSubmission.id}` : null,
    {
      fallbackData: initialSubmission,
      revalidateOnMount: true,
      onSuccess: (data, key) => {
        if (isGrading(data)) {
          setTimeout(() => mutate(key), ONE_SECOND)
        }
      },
    }
  )
}

export function keySubmissionWithSourceCode(submissionId: number) {
  return `submission/${submissionId}/code`
}

export function getSubmissionWithSourceCode(submissionId: number) {
  return api
    .get(keySubmissionWithSourceCode(submissionId))
    .json<SubmissionWithSourceCode>()
}

export function useSubmissionWithSourceCode(submissionId: number) {
  return useSWR(
    submissionId === 0 ? null : keySubmissionWithSourceCode(submissionId),
    () => getSubmissionWithSourceCode(submissionId)
  )
}

export function keySubmission(submissionId: number) {
  return `submission/${submissionId}`
}

export function getSubmission(submissionId: number) {
  return api.get(keySubmission(submissionId)).json<Submission>()
}

export function useSubmission(submissionId: number) {
  return useSWR(submissionId === 0 ? null : keySubmission(submissionId), () =>
    getSubmission(submissionId)
  )
}

export async function getLatestSubmission() {
  return api.get('submission/latest').res(async (r) => {
    try {
      return (await r.json()) as SubmissionWithProblem
    } catch {
      return null
    }
  })
}

export function useLatestSubmission() {
  const { isAuthenticated } = useUserData()
  return useSWR(
    isAuthenticated ? 'submission/latest' : null,
    getLatestSubmission,
    { revalidateOnMount: true }
  )
}

export function keyLatestProblemSubmission(problemId: number) {
  return `submission/problem/${problemId}/latest`
}

export async function getLatestProblemSubmission(problemId: number) {
  return api
    .get(keyLatestProblemSubmission(problemId))
    .json<SubmissionWithSourceCode>()
}

export function useLatestProblemSubmission(problemId: number) {
  const { isAuthenticated } = useUserData()
  return useSWR(
    isAuthenticated && problemId ? keyLatestProblemSubmission(problemId) : null,
    () => getLatestProblemSubmission(problemId),
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
