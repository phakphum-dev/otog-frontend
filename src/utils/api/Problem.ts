import useSWR from 'swr'
import { get } from '.'
import { useInitialData } from '@src/utils/hooks/useInitialData'

export interface ProblemDto {
  id: number
  name: string
  timeLimit: number
  memory: number
}

export async function getProblems() {
  return get<ProblemDto[]>('problem')
}

export function useProblems() {
  const { problems: initialData } = useInitialData()
  return useSWR<ProblemDto[]>('problem', { initialData })
}
