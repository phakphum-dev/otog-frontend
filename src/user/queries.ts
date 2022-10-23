import useSWR from 'swr'

import { CreateUser, User, UserProfile } from './types'

import { useAuth } from '@src/context/AuthContext'
import { http } from '@src/context/HttpClient'

export async function getUsers() {
  return http.get<User[]>('user')
}

export function useUsers() {
  return useSWR('user', getUsers)
}

export function keyUser(userId: number) {
  return ['user', userId] as const
}

export async function getUser(userId: number) {
  return http.get<UserProfile>(`user/${userId}/profile`)
}

export function useUser(userId: number) {
  return useSWR(keyUser(userId), () => getUser(userId))
}

export async function getOnlineUsers() {
  return http.get<User[]>('user/online')
}

export function useOnlineUsers() {
  const { isAuthenticated } = useAuth()
  return useSWR(isAuthenticated ? 'user/online' : null, getOnlineUsers, {
    revalidateOnMount: false,
  })
}

export async function registerUser(userData: CreateUser) {
  return http.post<User>('auth/register', userData)
}

export async function editShowname(userId: number, showName: string) {
  return http.patch<User>(`user/${userId}/name`, { showName })
}
