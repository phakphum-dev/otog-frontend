import useSWR from 'swr'
import { useAuth } from '@src/api/AuthProvider'
import { SubmissionWithProblem } from './useSubmission'

export type Role = 'user' | 'admin'

export interface User {
  id: number
  username: string
  showName: string
  role: Role
  rating: number
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

export function useUsers() {
  return useSWR<User>('user')
}

export function useUser(userId: number) {
  return useSWR<User>(`user/${userId}/profile`)
}

export function useOnlineUsers() {
  const { isAuthenticated } = useAuth()
  return useSWR<User[]>(isAuthenticated ? 'user/online' : null, {
    revalidateOnMount: false,
  })
}
