import { Language } from 'prism-react-renderer'
import { ProblemDto } from './Problem'
import { UserDto } from './User'

export interface SubmissionDto {
  id: number
  problem: ProblemDto
  user: UserDto
  timeUsed: number
  result: string
  score: number
  code: string
  language: Language
}
