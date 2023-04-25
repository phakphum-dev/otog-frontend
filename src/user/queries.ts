import useSWR from 'swr'

import { CreateUser, User, UserProfile } from './types'

import { client } from '@src/api'
import { useUserData } from '@src/context/UserContext'

export async function getUsers() {
  return client.get('user').json<User[]>()
}

export function useUsers() {
  return useSWR('user', getUsers)
}

export function keyUser(userId: number) {
  return ['user', userId] as const
}

export async function getUser(userId: number) {
  return client.get(`user/${userId}/profile`).json<UserProfile>()
}

export function useUser(userId: number) {
  return useSWR(keyUser(userId), () => getUser(userId))
}

export async function getOnlineUsers() {
  return client.get('user/online').json<User[]>()
}

export function useOnlineUsers() {
  const { isAuthenticated } = useUserData()
  return useSWR(isAuthenticated ? 'user/online' : null, getOnlineUsers, {
    revalidateOnMount: false,
  })
}

export async function registerUser(userData: CreateUser) {
  return client.url('auth/register').post(userData).json<User>()
}

export async function editShowname(userId: number, showName: string) {
  return client.url(`user/${userId}/name`).patch({ showName }).json<User>()
}
