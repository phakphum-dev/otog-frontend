import useSWR from 'swr'

import { Problem } from '../problem/useProblem'
import { Status } from '../submission/useSubmission'

import { User } from '@src/user/types'

export type ContestMode = 'rated' | 'unrated'
export type GradingMode = 'acm' | 'classic'

export interface CreateContest {
  name: string
  mode: ContestMode
  gradingMode: GradingMode
  timeStart: string
  timeEnd: string
}
export interface Contest extends CreateContest {
  id: number
  announce: any
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

export function useContest(contestId: number | undefined) {
  return useSWR<Contest>(contestId ? `contest/${contestId}` : null)
}

export function useContests() {
  return useSWR<Contest[]>('contest')
}

export function useContestScoreboard(contestId: number) {
  return useSWR<ContestScoreboard>(`contest/${contestId}/scoreboard`)
}
