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

export type ContestPrize = Record<Prize, MiniSubmission[]>
export type Prize = typeof prizes[number]
export const prizes = [
  'firstBlood',
  'fasterThanLight',
  'passedInOne',
  'oneManSolve',
] as const

export const prizeDescription: Record<
  Prize,
  { name: string; description: string; emoji: string }
> = {
  firstBlood: {
    name: 'First Blood',
    description: 'The first user that passed the task.',
    emoji: '💀',
  },
  fasterThanLight: {
    name: 'Faster Than Light',
    description: 'The user that solved the task with fastest algorithm.',
    emoji: '⚡️',
  },
  passedInOne: {
    name: 'Passed In One',
    description: 'The user that passed the task in one submission.',
    emoji: '🎯',
  },
  oneManSolve: {
    name: 'One Man Solve',
    description: 'The only one user that passed the task.',
    emoji: '🏅',
  },
}

export type MiniSubmission = {
  id: number
  problem: {
    id: number
  }
  user: {
    id: number
    showName: string
  }
}
