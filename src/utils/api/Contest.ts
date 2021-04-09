import useSWR from 'swr'
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

export type ContestScoreboard = Contest

export function useCurrentContest(initialContest?: Contest | null) {
  return useSWR<Contest | null>('contest/now', { initialData: initialContest })
}

export function useContests() {
  return useSWR<Contest[]>('contest')
}

export function useContestScoreboard(contestId: number) {
  return useSWR<ContestScoreboard>(`contest/${contestId}/scoreboard`)
}
