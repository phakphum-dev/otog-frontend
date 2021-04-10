import useSWR from 'swr'
import { Submission } from './Submission'

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
export type ProblemWithSubmission = Problem & { submission: Submission | null }

export function useProblem(id: string) {
  return useSWR<Problem>(id ? `problem/${id}` : null)
}

export function useProblems() {
  return useSWR<ProblemWithSubmission[]>('problem')
}
