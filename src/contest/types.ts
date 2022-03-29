import { Problem } from '../problem/types'

import { Status } from '@src/submission/types'
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
