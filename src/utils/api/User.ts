export type Role = 'user' | 'admin'

export interface UserDto {
  id: number
  username: string
  showName: string
  role: Role
  rating: number
  attendedContest: object
}

// export async function getUsers() {
//   return get<UserDto>('user')
// }
