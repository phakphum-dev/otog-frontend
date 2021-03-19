import useSWR from 'swr'

export interface ProblemDto {
  id: number
  name: string
  timeLimit: number
  memory: number
  sname: string
  score: number
  state: number
  recentShowTime: number
  case: string
  rating: number
}

export function useProblems() {
  return useSWR<ProblemDto[]>('problem')
}
