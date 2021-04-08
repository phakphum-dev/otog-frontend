import useSWR from 'swr'
import { useInitialData } from '../hooks/useInitialData'
import { Problem } from './Problem'

export interface Contest {
  id: number
  name: string
  mode: 'rated' | 'unrated'
  gradingMode: 'acm' | 'classic'
  timeStart: string
  timeEnd: string
  problems: Problem[]
}

export function useCurrentContest() {
  const initialData = useInitialData()
  return useSWR<Contest>('contest/now', { initialData })
}
