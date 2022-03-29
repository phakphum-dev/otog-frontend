import useSWR from 'swr'

import { Problem, ProblemWithSubmission } from './types'

import { User } from '@src/user/types'

export function usePassedUsers(problemId: number) {
  return useSWR<User[]>(`problem/${problemId}/user`)
}

export function useProblem(id: number) {
  return useSWR<Problem>(id ? `problem/${id}` : null)
}

export function useProblems() {
  return useSWR<ProblemWithSubmission[]>('problem')
}
