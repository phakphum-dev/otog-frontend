import useSWR, { mutate, useSWRInfinite } from 'swr'

import { Language } from 'prism-react-renderer'
import { Problem } from './useProblem'
import { User } from './useUser'
import { useInitialData } from '@src/hooks/useInitialData'
import { useAuth } from '@src/api/AuthProvider'
import { isGraded, isGrading } from './useStatusColor'
import { ONE_SECOND } from './useTimer'
import { useState } from 'react'
import { useSocket } from '@src/api/SocketProvider'

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

type SocketSubmission = [
  result: string,
  score: number,
  timeUsed: number,
  status: string,
  errmsg: string | null
]

export function useProblemSubmission(problemId: number) {
  const { isAuthenticated } = useAuth()
  const { socket } = useSocket()
  return useSWR<SubmissionWithSourceCode>(
    isAuthenticated && problemId
      ? `submission/problem/${problemId}/latest`
      : null,
    {
      revalidateOnFocus: false,
      onSuccess: (data, key) => {
        if (isGrading(data)) {
          socket?.on(
            `${data.id}`,
            ([result, score, timeUsed, status, errmsg]: SocketSubmission) => {
              mutate(
                key,
                { ...data, result, score, timeUsed, status, errmsg },
                false
              )
              if (status === 'accept' || status === 'reject') {
                socket.off(`${data.id}`)
              }
            }
          )
        }
      },
    }
  )
}
