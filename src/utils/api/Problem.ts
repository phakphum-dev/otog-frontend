import useSWR from 'swr'

export interface ProblemDto {
  id: number
  name: string
  timeLimit: number
  memoryLimit: number
  sname: string
  score: number
  state: number
  recentShowTime: number
  case: string
  rating: number
}

export function useProblem(id: string) {
  return useSWR<ProblemDto>(id ? `problem/${id}` : null)
}

export function useProblems() {
  return useSWR<ProblemDto[]>('problem')
}
