import { api } from '@src/context/HttpClient'
import { CreateUser, EditUser, User } from '@src/user/types'

export async function createUser(userData: CreateUser) {
  return api.url('user').post(userData).json<User>()
}

export async function editUser(userId: number, userData: EditUser) {
  return api.url(`user/${userId}`).put(userData).json<User>()
}
