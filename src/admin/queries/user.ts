import { HttpClient } from '@src/context/HttpClient'
import { CreateUser, User } from '@src/user/types'

export async function createUser(client: HttpClient, userData: CreateUser) {
  return client.post<User>('user', userData)
}
