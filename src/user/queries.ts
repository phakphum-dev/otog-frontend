import { CreateUser, User } from './types'

import { HttpClient } from '@src/context/HttpClient'

export async function registerUser(client: HttpClient, userData: CreateUser) {
  return client.post<User>('auth/register', userData)
}

export async function editShowname(
  client: HttpClient,
  userId: number,
  showName: string
) {
  return client.patch<User>(`user/${userId}/name`, { showName })
}
