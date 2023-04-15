import useSWR from 'swr'

import { Problem, ProblemWithSubmission } from './types'

import { api } from '@src/api'
import { User } from '@src/user/types'

export function usePassedUsers(problemId: number) {
  return useSWR<User[]>(`problem/${problemId}/user`)
}

export function keyProblem(id: number) {
  return `problem/${id}`
}

export async function getProblem(id: number) {
  return api.get(keyProblem(id)).json<Problem>()
}

export function useProblem(id: number) {
  return useSWR(id ? keyProblem(id) : null, () => getProblem(id))
}

export async function getProblems() {
  return api.get('problem').json<ProblemWithSubmission[]>()
}

export function useProblems() {
  return useSWR('problem', getProblems)
}
