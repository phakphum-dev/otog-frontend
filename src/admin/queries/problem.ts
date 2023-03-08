import { http } from '@src/context/HttpClient'
import { Problem, Testcase } from '@src/problem/types'

export type CreateProblem = Pick<
  Problem,
  'name' | 'score' | 'timeLimit' | 'memoryLimit' | 'case'
>

// TODO: type safe
export async function createProblem(formData: FormData) {
  return http.post<Problem>('problem', formData)
}

export async function updateProblem(problemId: number, formData: FormData) {
  return http.put<Problem>(`problem/${problemId}`, formData)
}

export async function toggleProblem(problemId: number, show: boolean) {
  return http.patch<Problem>(`problem/${problemId}`, { show })
}

export async function deleteProblem(problemId: number) {
  return http.del<Problem>(`problem/${problemId}`)
}

export async function updateProblemExamples(
  problemId: number,
  examples: Testcase[]
) {
  return http.put<Problem>(`problem/${problemId}/examples`, examples)
}
