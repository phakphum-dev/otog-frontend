import { http } from '@src/context/HttpClient'
import { CreateUser, EditUser, User } from '@src/user/types'

export async function createUser(userData: CreateUser) {
  return http.post<User>('user', userData)
}

export async function editUser(userId: number, userData: EditUser) {
  return http.put<User>(`user/${userId}`, userData)
}
