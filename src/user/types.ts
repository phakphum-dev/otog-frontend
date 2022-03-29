import { SubmissionWithProblem } from '@src/submission/useSubmission'

export type Role = 'user' | 'admin'

export interface User {
  id: number
  username: string
  showName: string
  role: Role
  rating: number
}

export type CreateUser = Pick<User, 'showName' | 'username'> & {
  password: string
}

export interface LoginReq {
  username: string
  password: string
}

export interface AuthRes {
  user: User
  accessToken: string
}

export interface UserContest {
  id: number
  name: string
  timeEnd: string
  detail: {
    rank: number
    ratingAfterUpdate: number
  }
}

export interface UserProfile extends User {
  attendedContest: UserContest[]
}

export interface UserContestData extends User {
  creationDate: string
  updateDate: string
  attendedContest: UserProfile[]
  submissions: SubmissionWithProblem[]
}
