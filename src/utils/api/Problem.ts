import useSWR from 'swr'
import { Submission } from './Submission'
import { User } from './User'

export interface Problem {
  id: number
  name: string
  timeLimit: number
  memoryLimit: number
  sname: string
  score: number
  show: boolean
  recentShowTime: string
  case: string
  rating: number | null
}
export type ProblemWithSubmission = Problem & {
  submission: Submission | null
  passedCount: number
}

export function usePassedUsers(problemId: number) {
  return useSWR<User[]>(`problem/${problemId}/user`)
}

export function useProblem(id: number) {
  return useSWR<Problem>(id ? `problem/${id}` : null)
}

export function useProblems() {
  return useSWR<ProblemWithSubmission[]>('problem')
}
