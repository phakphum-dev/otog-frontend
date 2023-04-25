import { client } from '@src/api'
import { CreateUser, EditUser, User } from '@src/user/types'

export async function createUser(userData: CreateUser) {
  return client.url('user').post(userData).json<User>()
}

export async function editUser(userId: number, userData: EditUser) {
  return client.url(`user/${userId}`).put(userData).json<User>()
}
