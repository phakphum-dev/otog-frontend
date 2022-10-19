import { CreateUser, User } from './types'

import { http } from '@src/context/HttpClient'

export async function registerUser(userData: CreateUser) {
  return http.post<User>('auth/register', userData)
}

export async function editShowname(userId: number, showName: string) {
  return http.patch<User>(`user/${userId}/name`, { showName })
}
