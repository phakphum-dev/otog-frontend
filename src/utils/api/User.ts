export interface UserDto {
  id: number
  username: string
  showName: string
  role: string
  rating: number
  attendedContest: object
}

// export async function getUsers() {
//   return get<UserDto>('user')
// }
