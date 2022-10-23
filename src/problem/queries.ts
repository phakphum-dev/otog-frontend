import useSWR from 'swr'

import { Problem, ProblemWithSubmission } from './types'

import { http } from '@src/context/HttpClient'
import { User } from '@src/user/types'

export function usePassedUsers(problemId: number) {
  return useSWR<User[]>(`problem/${problemId}/user`)
}

export function keyProblem(id: number) {
  return `problem/${id}`
}

export async function getProblem(id: number) {
  return http.get<Problem>(keyProblem(id))
}

export function useProblem(id: number) {
  return useSWR(id ? keyProblem(id) : null, () => getProblem(id))
}

export async function getProblems() {
  return http.get<ProblemWithSubmission[]>('problem')
}

export function useProblems() {
  return useSWR('problem', getProblems)
}
