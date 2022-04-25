import { HttpClient } from '@src/context/HttpClient'
import { CreateUser, EditUser, User } from '@src/user/types'

export async function createUser(client: HttpClient, userData: CreateUser) {
  return client.post<User>('user', userData)
}

export async function editUser(
  client: HttpClient,
  userId: number,
  userData: EditUser
) {
  return client.put<User>(`user/${userId}`, userData)
}
