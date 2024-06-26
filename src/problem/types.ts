import { Submission } from '@src/submission/types'

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
  examples: Testcase[]
}

export type ProblemWithSubmission = Problem & {
  submission: Submission | null
  passedCount: number
}

export type Testcase = {
  input: string
  output: string
}
