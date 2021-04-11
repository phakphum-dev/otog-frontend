import useSWR from 'swr'
import { Problem } from './Problem'
import { Status } from './Submission'
import { User } from './User'

export interface Contest {
  id: number
  name: string
  mode: 'rated' | 'unrated'
  gradingMode: 'acm' | 'classic'
  timeStart: string
  timeEnd: string
  announce: object
  problems: Problem[]
}

export interface ContestSubmission {
  score: number
  timeUsed: number
  status: Status
  problemId: number
}

export type UserWithSubmission = User & {
  submissions: ContestSubmission[]
}

export type ContestScoreboard = Contest & {
  users: UserWithSubmission[]
}

export function useCurrentContest(initialContest?: Contest | null) {
  return useSWR<Contest | null>('contest/now', { initialData: initialContest })
}

export function useContests() {
  return useSWR<Contest[]>('contest')
}

export function useContestScoreboard(contestId: number) {
  return useSWR<ContestScoreboard>(`contest/${contestId}/scoreboard`)
}
