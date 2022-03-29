import { HttpClient } from '@src/context/HttpClient'
import { Problem } from '@src/problem/useProblem'

export type CreateProblem = Pick<
  Problem,
  'name' | 'score' | 'timeLimit' | 'memoryLimit' | 'case'
>

// TODO: type safe
export async function createProblem(client: HttpClient, formData: FormData) {
  return client.post<Problem>('problem', formData)
}

export async function updateProblem(
  client: HttpClient,
  problemId: number,
  formData: FormData
) {
  return client.put<Problem>(`problem/${problemId}`, formData)
}

export async function toggleProblem(
  client: HttpClient,
  problemId: number,
  show: boolean
) {
  return client.patch<Problem>(`problem/${problemId}`, { show })
}

export async function deleteProblem(client: HttpClient, problemId: number) {
  return client.del<Problem>(`problem/${problemId}`)
}
