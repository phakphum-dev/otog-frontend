import useSWR from 'swr'

import { User } from './types'

import { useAuth } from '@src/context/AuthContext'

export function useUsers() {
  return useSWR<User[]>('user')
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
