import { User } from '@src/user/types'

export type Message = {
  id: number
  message: string
  creationDate: string
  user: Omit<User, 'role' | 'username'>
}
