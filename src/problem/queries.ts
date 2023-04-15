import useSWR from 'swr'

import { Problem, ProblemWithSubmission } from './types'

import { client } from '@src/api'
import { User } from '@src/user/types'

export function usePassedUsers(problemId: number) {
  return useSWR<User[]>(`problem/${problemId}/user`)
}

export function keyProblem(id: number) {
  return `problem/${id}`
}

export async function getProblem(id: number) {
  return client.get(keyProblem(id)).json<Problem>()
}

export function useProblem(id: number) {
  return useSWR(id ? keyProblem(id) : null, () => getProblem(id))
}

export async function getProblems() {
  return client.get('problem').json<ProblemWithSubmission[]>()
}

export function useProblems() {
  return useSWR('problem', getProblems)
}
